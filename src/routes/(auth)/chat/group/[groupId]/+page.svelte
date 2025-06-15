<script lang="ts">
  import { page } from "$app/state";
  import { smartFly } from "$lib/animation/visibleFly";
  import {
    addGroupMember,
    getGroupInfo,
    leaveGroup as leaveGroupApi,
    type GroupInfo,
  } from "$lib/api/group/member";
  import {
    listGroupMessages,
    uploadGroupMessageFile,
    type GroupMessage,
  } from "$lib/api/group/message";
  import { RoomKind } from "$lib/api/room";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import {
    listAllUsers,
    PublicStatus,
    type ListAllUsersResponse,
  } from "$lib/api/user";
  import ws from "$lib/api/ws";
  import "$lib/assets/styles/chats.css";
  import FileDropZone from "$lib/components/app/FileDropZone.svelte";
  import HoveredUserProfile from "$lib/components/app/HoveredUserProfile.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Sheet from "$lib/components/ui/sheet";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "$lib/components/ui/tooltip";
  import { error, success } from "$lib/toast/toast";
  import { cn } from "$lib/utils";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters";
  import { formatDate } from "$lib/utils/formatDate";
  import { goto } from "$lib/utils/goto";
  import { scrollToBottom } from "$lib/utils/scrollToBottom";
  import { FileIcon } from "@lucide/svelte";
  import NumberFlow from "@number-flow/svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import {
    Crown,
    Languages,
    LogOut,
    MoreVertical,
    Pen,
    Send,
    Trash2,
    UserPlus,
    Users,
  } from "lucide-svelte";
  import type { AuthenticatedUserState } from "src/routes/(auth)/authenticatedUser.svelte";
  import { onDestroy, tick } from "svelte";

  type CustomGroupMessage = GroupMessage & {
    editMode?: boolean;
    editInputElement?: HTMLInputElement;
  };

  const { authenticatedUserState } = page.data as {
    authenticatedUserState: AuthenticatedUserState;
  };

  const authenticatedUser = $derived(authenticatedUserState.user);

  const aroundMessageId = $derived(
    page.url.searchParams.get("aroundMessageId"),
  );

  let currentGroupId = $derived(page.params.groupId);
  let groupInfo: GroupInfo = $state(null);
  let currentMessage = $state("");
  let currentRoom: { id: string | null; messages: CustomGroupMessage[] } =
    $state({
      id: null,
      messages: [],
    });

  let showMembersSheet = $state(false);
  let showInviteDialog = $state(false);
  let deleteMessageDialog: {
    open: boolean;
    message: CustomGroupMessage | null;
  } = $state({
    open: false,
    message: null,
  });

  let selectedFiles: File[] = $state([]);
  let sendFileDialogOpen = $state(false);

  // Invite members states
  let allUsers: ListAllUsersResponse[] = $state([]);
  let selectedUserIds = $state(new Set<string>());
  let isLoadingUsers = $state(false);
  let isInviting = $state(false);

  let unsubscribeSendMessage = null;
  let unsubscribeMessageReactionAdded = null;
  let unsubscribeMessageReactionRemoved = null;
  let unsubscribeUserStatusUpdated = null;
  let unsubscribeGroupMemberAdded = null;
  let unsubscribeGroupMemberRemoved = null;
  let unsubscribeGroupMessageContentEdited = null;
  let unsubscribeGroupMessageDeleted = null;
  let unsubscribeGroupMessageAttachmentCreated = null;
  let inputElement: HTMLDivElement = $state(null);
  let elementsList: HTMLDivElement = $state(null);
  let isAutoScrolling = $state(false);

  // Ces deux références DOM serviront de sentinelles
  let topSentinel: HTMLDivElement = $state(null);
  let bottomSentinel: HTMLDivElement = $state(null);

  // Observers pour le haut et le bas
  let topObserver: IntersectionObserver = $state(null);
  let bottomObserver: IntersectionObserver = $state(null);

  const LIMIT_LOAD = 50;
  const MAX_MESSAGES = 75;

  // Check if current user is admin
  const isAdmin = $derived(
    groupInfo?.members?.find((m) => m.userId === authenticatedUser.id)
      ?.isGroupOwner || false,
  );

  $effect(() => {
    joinRoomAndListenMessages(currentGroupId);
    getGroupInfo(currentGroupId).then((info) => {
      groupInfo = info;
    });

    return () => {
      unsubscribeSendMessage?.();
      unsubscribeMessageReactionAdded?.();
      unsubscribeMessageReactionRemoved?.();
      unsubscribeUserStatusUpdated?.();
      unsubscribeGroupMemberAdded?.();
      unsubscribeGroupMemberRemoved?.();
      unsubscribeGroupMessageContentEdited?.();
      unsubscribeGroupMessageDeleted?.();
      unsubscribeGroupMessageAttachmentCreated?.();
      ws.leaveRoom(currentRoom.id);
      currentRoom.id = null;
      currentRoom.messages = [];
    };
  });

  // Load all users when invite dialog opens
  $effect(() => {
    if (showInviteDialog) {
      loadAllUsers();
    }
  });
  const loadAllUsers = async () => {
    try {
      isLoadingUsers = true;
      allUsers = await listAllUsers();

      // Filter out users who are already members
      const userIds = new Set(groupInfo.members.map((m) => m.userId));
      allUsers = allUsers.filter((user) => !userIds.has(user.id));

      selectedUserIds = new Set();
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      isLoadingUsers = false;
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.has(userId)) {
      selectedUserIds.delete(userId);
    } else {
      selectedUserIds.add(userId);
    }
    selectedUserIds = new Set(selectedUserIds); // Trigger reactivity
  };

  const inviteMembers = async () => {
    if (selectedUserIds.size === 0) {
      error(
        "Aucun utilisateur sélectionné",
        "Veuillez sélectionner au moins un utilisateur à inviter.",
      );
      return;
    }

    try {
      isInviting = true;

      for (const userId of selectedUserIds) {
        await addGroupMember(currentGroupId, userId);
      }

      showInviteDialog = false;
      selectedUserIds = new Set();

      // Refresh group info
      groupInfo = await getGroupInfo(currentGroupId);
    } catch (error) {
      console.error("Failed to invite members:", error);
      error(
        "Erreur lors de l'invitation des membres.",
        "Impossible d'inviter les membres, veuillez réessayer plus tard.",
      );
    } finally {
      isInviting = false;
    }
  };

  const leaveGroup = async () => {
    try {
      await leaveGroupApi(currentGroupId);
      await goto("/");
    } catch (e) {
      console.error("Failed to leave group:", error);
      error(
        "Erreur lors de la sortie du groupe.",
        "Impossible de quitter le groupe, veuillez réessayer plus tard.",
      );
    }
  };

  const joinRoomAndListenMessages = async (groupId: string) => {
    try {
      currentRoom.messages = await listGroupMessages(groupId, {
        limit: LIMIT_LOAD,
        aroundMessageId,
      });
      currentRoom.messages = currentRoom.messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      const joinedRoom = await ws.asyncGroupJoinRoom(groupId, RoomKind.GROUP);
      currentRoom.id = joinedRoom;

      await tick();
      if (aroundMessageId) {
        const aroundMessageElement = document.querySelector(
          "[data-message-id='" + aroundMessageId + "']",
        );
        if (aroundMessageElement) {
          aroundMessageElement.scrollIntoView({ block: "center" });
        }
      } else {
        await scrollToBottom(elementsList, "auto");
      }

      topObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadPreviousMessages();
            }
          });
        },
        { root: null, threshold: 0.1 },
      );

      bottomObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isAutoScrolling) {
              loadNextMessages();
            }
          });
        },
        { root: null, threshold: 0.1 },
      );

      if (topSentinel) {
        topObserver.observe(topSentinel);
      }
      if (bottomSentinel) {
        bottomObserver.observe(bottomSentinel);
      }

      unsubscribeSendMessage = ws.subscribe(
        "send-group-message",
        async (msg) => {
          currentRoom.messages.push({
            id: msg.messageId,
            content: msg.content,
            author: {
              userId: msg.sender.userId,
              firstName: msg.sender.firstName,
              lastName: msg.sender.lastName,
            },
            createdAt: new Date(msg.createdAt),
            reactions: [],
            attachments: msg.attachments.map((attachment) => ({
              id: attachment.id,
              name: attachment.name,
            })),
          });

          await tick();
          await scrollToBottomSafe(elementsList);
        },
      );

      unsubscribeMessageReactionAdded = ws.subscribe(
        "group-message-reaction-added",
        (msg) => {
          const message = currentRoom.messages.find(
            (m) => m.id === msg.messageId,
          );
          if (message) {
            const reaction = message.reactions.find(
              (r) => r.reaction === msg.reaction,
            );
            if (reaction) {
              reaction.users = [
                ...reaction.users,
                { id: msg.member.userId, name: msg.member.username },
              ];
            } else {
              message.reactions = [
                ...message.reactions,
                {
                  reaction: msg.reaction,
                  users: [{ id: msg.member.userId, name: msg.member.username }],
                },
              ];
            }
          }
        },
      );

      unsubscribeMessageReactionRemoved = ws.subscribe(
        "group-message-reaction-removed",
        (msg) => {
          const message = currentRoom.messages.find(
            (m) => m.id === msg.messageId,
          );
          if (message) {
            const reaction = message.reactions.find(
              (r) => r.reaction === msg.reaction,
            );
            if (reaction) {
              reaction.users = reaction.users.filter(
                ({ id }) => id !== msg.member.userId,
              );
              if (reaction.users.length === 0) {
                message.reactions = message.reactions.filter(
                  (r) => r.reaction !== msg.reaction,
                );
              }
            }
          }
        },
      );

      unsubscribeGroupMemberAdded = ws.subscribe(
        "group-member-added",
        async (msg) => {
          if (msg.groupId === currentGroupId) {
            // Refresh group info
            groupInfo = await getGroupInfo(currentGroupId);
          }
        },
      );

      unsubscribeGroupMemberRemoved = ws.subscribe(
        "group-member-removed",
        async (msg) => {
          if (msg.groupId === currentGroupId) {
            // Refresh group info
            groupInfo = await getGroupInfo(currentGroupId);
          }
        },
      );

      unsubscribeGroupMessageContentEdited = ws.subscribe(
        "group-message-content-edited",
        (msg) => {
          const message = currentRoom.messages.find(
            (m) => m.id === msg.messageId,
          );
          if (message) {
            message.content = msg.newContent;
          }
        },
      );

      unsubscribeGroupMessageDeleted = ws.subscribe(
        "group-message-deleted",
        (msg) => {
          currentRoom.messages = currentRoom.messages.filter(
            (m) => m.id !== msg.messageId,
          );
          if (
            deleteMessageDialog.open &&
            deleteMessageDialog.message?.id === msg.messageId
          ) {
            deleteMessageDialog.open = false;
            deleteMessageDialog.message = null;
          }
        },
      );

      unsubscribeGroupMessageAttachmentCreated = ws.subscribe(
        "group-attachment-created",
        async ({ message }) => {
          currentRoom.messages.push({
            id: message.id,
            content: "",
            author: {
              userId: message.authorUserId,
              firstName: message.authorFirstName,
              lastName: message.authorLastName,
            },
            createdAt: new Date(message.createdAt),
            reactions: [],
            attachments: [
              {
                id: message.attachmentFileId,
                name: message.attachmentFileName,
              },
            ],
          });

          await tick();
          await scrollToBottomSafe(elementsList);
        },
      );
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottomSafe = async (element) => {
    if (!element) return;
    isAutoScrolling = true;
    await scrollToBottom(element, "auto");
    setTimeout(() => {
      isAutoScrolling = false;
    }, 300);
  };

  const loadPreviousMessages = async () => {
    if (currentRoom.messages.length === 0) return;
    try {
      const oldest = currentRoom.messages[0];
      const newMessages = await listGroupMessages(currentGroupId, {
        limit: LIMIT_LOAD,
        before: oldest.createdAt,
      });
      if (newMessages.length > 0) {
        currentRoom.messages = [
          ...newMessages.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
          ),
          ...currentRoom.messages,
        ];
        while (currentRoom.messages.length > MAX_MESSAGES) {
          currentRoom.messages.pop();
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages précédents:", err);
    }
  };

  const loadNextMessages = async () => {
    if (currentRoom.messages.length === 0) return;
    try {
      const newest = currentRoom.messages[currentRoom.messages.length - 1];
      const newMessages = await listGroupMessages(currentGroupId, {
        limit: LIMIT_LOAD,
        after: newest.createdAt,
      });
      if (newMessages.length > 0) {
        currentRoom.messages = [
          ...currentRoom.messages,
          ...newMessages.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
          ),
        ];
        while (currentRoom.messages.length > MAX_MESSAGES) {
          currentRoom.messages.shift();
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages suivants:", err);
    }
  };

  const handleMessageReactionToggle = (messageId: string, reaction: string) => {
    ws.toggleGroupMessageReaction(currentGroupId, messageId, reaction);
  };

  const sendMessageToWs = async () => {
    if (currentMessage.trim() === "") return;

    const now = new Date();
    const lastMessage = currentRoom.messages[currentRoom.messages.length - 1];
    const timeDiff = lastMessage
      ? (now.getTime() - lastMessage.createdAt.getTime()) / 1000 / 60
      : 0;

    ws.sendGroupMessage(currentGroupId, currentMessage);
    currentMessage = "";

    // Si l'utilisateur est "loin" dans l'historique (ex. dernier message > 5 min), recharge les messages récents
    if (timeDiff > 5) {
      currentRoom.messages = await listGroupMessages(currentGroupId, {
        limit: LIMIT_LOAD,
      });
      currentRoom.messages = currentRoom.messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    }
  };

  $effect(() => {
    if (currentMessage.trim() === "" && inputElement)
      inputElement.innerText = "";
  });

  $effect(() => {
    return ws.subscribe("user-status-updated", (msg) => {
      if (groupInfo?.members) {
        const member = groupInfo.members.find((m) => m.userId === msg.userId);
        if (member) {
          member.status = msg.status;
        }
      }

      // Change allUsers status
      const user = allUsers.find((u) => u.id === msg.userId);
      if (user) {
        user.status = msg.status;
      }
    });
  });

  $effect(() => {
    return ws.subscribe("group-member-added", (msg) => {
      // Add the user to the group info members
      if (msg.groupId === currentGroupId) {
        getGroupInfo(currentGroupId).then((info) => {
          groupInfo = info;
        });
      }

      // Remove the user from allUsers if they were there
      allUsers = allUsers.filter((u) => u.id !== msg.member.userId);
    });
  });

  $effect(() => {
    return ws.subscribe("group-member-removed", async (msg) => {
      // Remove the user to the group info members
      if (msg.groupId === currentGroupId) {
        getGroupInfo(currentGroupId).then((info) => {
          groupInfo = info;
        });
      }

      // Add the user from allUsers if they were there
      allUsers = await listAllUsers();
      allUsers = allUsers.filter((u) => u.id !== msg.userId);
    });
  });

  $effect(() => {
    return ws.subscribe("group-ownership-transferred", (msg) => {
      // Refresh group info to reflect ownership change
      if (msg.groupId === currentGroupId) {
        getGroupInfo(currentGroupId).then((info) => {
          groupInfo = info;
        });
      }
    });
  });

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageToWs();
    }
  };

  onDestroy(() => {
    if (topObserver) topObserver.disconnect();
    if (bottomObserver) bottomObserver.disconnect();
  });

  const handleMessageEdit = async (message: CustomGroupMessage) => {
    // Toggle edit mode
    message.editMode = !message.editMode;
    if (message.editMode) {
      await tick(); // Wait for the DOM to update
      // Focus the input element if entering edit mode
      message.editInputElement?.focus();
    } else {
      // Send the edited message
      ws.editGroupMessage(currentGroupId, message.id, message.content);
    }
  };

  const handleMessageDelete = async (message: CustomGroupMessage) => {
    if (!message) return;

    try {
      await ws.deleteGroupMessage(currentGroupId, message.id);
    } catch (error) {
      console.error("Failed to delete message:", error);
      error(
        "Erreur lors de la suppression du message.",
        "Impossible de supprimer le message, veuillez réessayer plus tard.",
      );
    }
  };

  function handleFilesSelected(event: File[]) {
    selectedFiles = event;
  }

  function handleError(event: string) {
    error("Erreur", event);
  }

  async function uploadFiles() {
    if (selectedFiles.length === 0) return;

    try {
      // Replace with your upload endpoint
      await uploadGroupMessageFile(
        currentGroupId,
        selectedFiles[0], // Assuming single file upload for simplicity
      );

      sendFileDialogOpen = false;
      success("Fichiers envoyés", "Fichiers envoyés avec succès!");
      selectedFiles = [];
    } catch (error) {
      error("Erreur", "Echec de l'envoi des fichiers.");
    }
  }
</script>

<div class="relative w-full h-full flex flex-col gap-y-4">
  {#if groupInfo}
    <div
      class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4"
    >
      <div class="flex items-center gap-x-3">
        <div class="relative size-12">
          <Avatar.Root class="size-12">
            <Avatar.Fallback class="bg-primary text-primary-foreground">
              {fallbackAvatarLetters(groupInfo.name)}
            </Avatar.Fallback>
          </Avatar.Root>
        </div>

        <div class="flex flex-col">
          <span class="font-semibold text-xl">{groupInfo.name}</span>
          <span class="text-gray-500 text-sm">
            {groupInfo.members.length} membre{groupInfo.members.length > 1
              ? "s"
              : ""}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => (showMembersSheet = true)}
          class="flex items-center gap-2"
        >
          <Users size={16} />
          Membres
        </Button>

        <Button
          variant="outline"
          size="sm"
          onclick={() => (showInviteDialog = true)}
          class="flex items-center gap-2"
        >
          <UserPlus size={16} />
          Inviter
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="outline" size="sm">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              onclick={leaveGroup}
              class="text-red-600 focus:text-red-600"
            >
              <LogOut size={16} class="mr-2" />
              Quitter le groupe
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  {/if}

  <div
    class="flex-1 h-full overflow-y-auto px-4 space-y-4 mb-8"
    bind:this={elementsList}
  >
    {#if currentRoom.id !== null}
      <div bind:this={topSentinel} class="sentinel mt-4"></div>

      {#each currentRoom.messages as message, i (message.id)}
        <div
          data-message-id={message.id}
          in:smartFly|global={{
            y: -10,
            duration: 300,
            delay: 100,
            isNewMessage: i >= Math.max(0, currentRoom.messages.length - 10),
            messageIndex: i,
            totalMessages: currentRoom.messages.length,
            staggerDelay: 50, // 50ms delay between each message
          }}
        >
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <div
                class="flex gap-x-4 items-start"
                class:justify-end={message.author.userId ===
                  authenticatedUser.id}
              >
                {#snippet messageReaction()}
                  <div class="flex items-center gap-2 mb-4">
                    {#each message.reactions as { reaction, users } (reaction)}
                      <div
                        class={cn(
                          "flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-lg gap-x-2 transition-colors duration-300 select-none",
                          {
                            "ring-2 ring-primary !bg-primary/30": users.find(
                              ({ id }) => id === authenticatedUser.id,
                            ),
                          },
                        )}
                        onclick={() =>
                          handleMessageReactionToggle(message.id, reaction)}
                        role="button"
                        tabindex="-1"
                      >
                        <span>{reaction}</span>
                        <NumberFlow
                          spinTiming={{ duration: 150 }}
                          value={users.length}
                        />
                      </div>
                    {/each}
                  </div>
                {/snippet}

                {#if message.author !== null && message.author.userId !== authenticatedUser.id}
                  <HoveredUserProfile
                    userId={message.author.userId}
                    self={false}
                  >
                    <Avatar.Root class="flex-shrink-0">
                      <Avatar.Image
                        src={getS3ObjectUrl(
                          S3Bucket.USERS_AVATARS,
                          message.author.userId,
                        )}
                      />
                      <Avatar.Fallback>
                        {fallbackAvatarLetters(
                          message.author.firstName +
                            " " +
                            message.author.lastName,
                        )}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </HoveredUserProfile>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <HoveredUserProfile
                        userId={message.author.userId}
                        self={false}
                      >
                        <span class="font-semibold">
                          {message.author.firstName}
                          {message.author.lastName}
                        </span>
                      </HoveredUserProfile>
                      {#if groupInfo?.members?.find((m) => m.userId === message.author.userId)?.isGroupOwner}
                        <Tooltip>
                          <TooltipTrigger>
                            <Crown size={14} class="text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>Administrateur</TooltipContent>
                        </Tooltip>
                      {/if}
                      <Tooltip>
                        <TooltipTrigger>
                          <span class="text-sm text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(
                            new Date(message.createdAt),
                            "EEEE d MMMM yyyy à HH:mm",
                            { locale: fr },
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div class="flex flex-col gap-y-2">
                      <div class="flex items-center gap-2">
                        {#each message.attachments as attachment}
                          <div class="mt-2 flex flex-col items-start">
                            <Button
                              variant="ghost"
                              href={getS3ObjectUrl(
                                S3Bucket.GROUPS_ATTACHMENTS,
                                attachment.id,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="w-[50px] h-[50px]"
                            >
                              <FileIcon />
                            </Button>
                            <span class="text-sm text-gray-500">
                              {attachment.name}
                            </span>
                          </div>
                        {/each}
                        {#if message.content.trim() !== ""}
                          <span
                            class="p-2 rounded-xl break-all bg-primary text-white shadow-lg"
                          >
                            {message.content}
                          </span>
                        {/if}
                      </div>
                      {@render messageReaction()}
                    </div>
                  </div>
                {/if}

                {#if message.author.userId === authenticatedUser.id}
                  <div class="flex flex-col">
                    <div class="flex flex-col gap-y-2">
                      <div class="flex items-end gap-2 justify-end">
                        <div class="flex flex-col items-end gap-y-2">
                          <div class="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger class="text-left">
                                <span class="text-sm text-gray-500">
                                  {formatDate(message.createdAt)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {format(
                                  new Date(message.createdAt),
                                  "EEEE d MMMM yyyy à HH:mm",
                                  { locale: fr },
                                )}
                              </TooltipContent>
                            </Tooltip>
                            {#if isAdmin}
                              <Tooltip>
                                <TooltipTrigger>
                                  <Crown size={14} class="text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>Administrateur</TooltipContent>
                              </Tooltip>
                            {/if}
                          </div>
                          {#if message.editMode}
                            <input
                              type="text"
                              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 w-full"
                              bind:this={message.editInputElement}
                              bind:value={message.content}
                              onkeydown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleMessageEdit(message);
                                }
                              }}
                            />
                          {:else}
                            <div class="flex items-center gap-2">
                              {#each message.attachments as attachment}
                                <div class="mt-2 flex flex-col items-end">
                                  <Button
                                    variant="ghost"
                                    href={getS3ObjectUrl(
                                      S3Bucket.GROUPS_ATTACHMENTS,
                                      attachment.id,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="w-[50px] h-[50px]"
                                  >
                                    <FileIcon />
                                  </Button>
                                  <span class="text-sm text-gray-500">
                                    {attachment.name}
                                  </span>
                                </div>
                              {/each}
                              {#if message.content.trim() !== ""}
                                <span
                                  class="p-2 rounded-xl break-all bg-primary text-white shadow-lg w-full"
                                >
                                  {message.content}
                                </span>
                              {/if}
                            </div>
                          {/if}
                        </div>

                        <HoveredUserProfile
                          userId={message.author.userId}
                          self={true}
                        >
                          <Avatar.Root
                            class="flex-shrink-0 -translate-y-[2px] -p-[2px]"
                          >
                            <Avatar.Image
                              src={getS3ObjectUrl(
                                S3Bucket.USERS_AVATARS,
                                message.author.userId,
                              )}
                            />
                            <Avatar.Fallback>
                              {fallbackAvatarLetters(
                                message.author.firstName +
                                  " " +
                                  message.author.lastName,
                              )}
                            </Avatar.Fallback>
                          </Avatar.Root>
                        </HoveredUserProfile>
                      </div>

                      {@render messageReaction()}
                    </div>
                  </div>
                {/if}
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content class="w-64">
              <ContextMenu.Item
                class="flex justify-between hover:!bg-white dark:hover:!bg-popover"
              >
                {#each ["😊", "😂", "🤷‍♂️", "👍"] as emoji}
                  <div
                    class="flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors duration-300 p-2 rounded-full w-8 h-8 text-lg"
                    onclick={() =>
                      handleMessageReactionToggle(message.id, emoji)}
                    role="button"
                    tabindex="-1"
                  >
                    {emoji}
                  </div>
                {/each}
              </ContextMenu.Item>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger
                  >Ajouter une réaction</ContextMenu.SubTrigger
                >
                <ContextMenu.SubContent class="min-w-max">
                  {#each ["😉", "😎", "😢"] as emoji}
                    <ContextMenu.Item
                      class="text-lg"
                      onclick={() =>
                        handleMessageReactionToggle(message.id, emoji)}
                      role="button"
                      tabindex={-1}
                    >
                      {emoji}
                    </ContextMenu.Item>
                  {/each}
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
              {#if message.author.userId === authenticatedUser.id}
                <ContextMenu.Separator />
                <ContextMenu.Item
                  class="flex justify-between"
                  onclick={() => {
                    handleMessageEdit(message);
                  }}
                >
                  <span>Modifier</span>
                  <div>
                    <Pen size="18" />
                  </div>
                </ContextMenu.Item>
                <ContextMenu.Item
                  class="text-red-500 hover:!bg-red-500 hover:!text-white flex justify-between"
                  onclick={() => {
                    deleteMessageDialog.open = true;
                    deleteMessageDialog.message = message;
                  }}
                >
                  <span>Supprimer</span>
                  <div>
                    <Trash2 size="18" />
                  </div>
                </ContextMenu.Item>
              {/if}
            </ContextMenu.Content>
          </ContextMenu.Root>
        </div>
      {/each}

      <div bind:this={bottomSentinel} class="sentinel mb-4"></div>
    {/if}
  </div>

  {#if groupInfo}
    <div
      class="flex items-center gap-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-t-[2px] border-t-primary"
    >
      <div
        class="flex-1 p-2 rounded-lg bg-white dark:bg-gray-700 min-h-[40px] max-h-32 overflow-y-auto break-all cursor-text"
        contenteditable
        placeholder="Écrivez un message au groupe"
        bind:this={inputElement}
        bind:innerText={currentMessage}
        onkeydown={handleInputKeyDown}
      ></div>

      <Button
        variant="ghost"
        href="/chat/group/{currentGroupId}/translate"
        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Languages size={20} class="text-primary" />
      </Button>

      <!-- Send file button -->
      <Dialog.Root bind:open={sendFileDialogOpen}>
        <Dialog.Trigger
          class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Envoyer un fichier"
        >
          <FileIcon size={20} class="text-primary" />
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Envoyer un fichier</Dialog.Title>
            <Dialog.Description>
              Sélectionnez un fichier à envoyer dans le groupe ({groupInfo.name}).
            </Dialog.Description>
          </Dialog.Header>

          <div class="container mx-auto p-6 max-w-2xl">
            <FileDropZone
              accept="image/*,.pdf,.doc,.docx"
              multiple={false}
              maxSize={5 * 1024 * 1024}
              filesSelected={handleFilesSelected}
              error={handleError}
              class="mb-6"
            />

            {#if selectedFiles.length > 0}
              <div class="flex gap-2">
                <button
                  class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  onclick={uploadFiles}
                >
                  Envoyer {selectedFiles.length} fichier(s)
                </button>
              </div>
            {/if}
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <button
        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onclick={sendMessageToWs}
      >
        <Send size={20} class="text-primary" />
      </button>
    </div>
  {/if}
</div>

<!-- Members Sheet -->
<Sheet.Root bind:open={showMembersSheet}>
  <Sheet.Content side="right" class="w-80">
    <Sheet.Header>
      <Sheet.Title class="flex items-center gap-2">
        <Users size={20} />
        Membres du groupe ({groupInfo?.members?.length || 0})
      </Sheet.Title>
    </Sheet.Header>

    <div class="space-y-3 mt-6">
      {#if groupInfo?.members}
        {#each groupInfo.members as member (member.id)}
          <HoveredUserProfile
            userId={member.userId}
            self={member.userId === authenticatedUser.id}
          >
            <div
              class="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <Avatar.Root class="size-10">
                    <Avatar.Image
                      src={getS3ObjectUrl(
                        S3Bucket.USERS_AVATARS,
                        member.userId,
                      )}
                    />
                    <Avatar.Fallback>
                      {fallbackAvatarLetters(member.userName)}
                    </Avatar.Fallback>
                  </Avatar.Root>

                  <span
                    class={cn(
                      "rounded-full absolute bottom-0 right-0 size-3 border-2 border-white dark:border-gray-800",
                      {
                        "bg-green-500": member.status === PublicStatus.ONLINE,
                        "bg-yellow-500": member.status === PublicStatus.AWAY,
                        "bg-red-500":
                          member.status === PublicStatus.DO_NOT_DISTURB,
                        "bg-gray-500": member.status === PublicStatus.OFFLINE,
                      },
                    )}
                  />
                </div>

                <div class="flex-1">
                  <div class="font-medium flex items-center gap-2 text-left">
                    {member.userName}
                    {#if member.isGroupOwner}
                      <Crown size={14} class="text-yellow-500" />
                    {/if}
                    {#if member.userId === authenticatedUser.id}
                      <span class="text-xs text-muted-foreground">(Vous)</span>
                    {/if}
                  </div>
                  <div class="text-sm text-muted-foreground text-left">
                    {member.email}
                  </div>
                </div>
              </div>
            </div>
          </HoveredUserProfile>
        {/each}
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>

<!-- Invite Members Dialog -->
<Dialog.Root bind:open={showInviteDialog}>
  <Dialog.Content class="max-w-2xl max-h-[80vh]">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <UserPlus size={20} />
        Inviter des membres
      </Dialog.Title>
      <Dialog.Description>
        Sélectionnez les utilisateurs que vous souhaitez inviter au groupe.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-6 py-4">
      <!-- Selected Users Count -->
      <div class="text-sm text-muted-foreground">
        {selectedUserIds.size} utilisateur{selectedUserIds.size > 1 ? "s" : ""} sélectionné{selectedUserIds.size >
        1
          ? "s"
          : ""}
      </div>

      <!-- Users List -->
      <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
        {#if isLoadingUsers}
          <div class="flex items-center justify-center py-8">
            <div class="text-sm text-muted-foreground">
              Chargement des utilisateurs...
            </div>
          </div>
        {:else}
          {#each allUsers as user (user.id)}
            <div
              class="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              onclick={() => toggleUserSelection(user.id)}
            >
              <Checkbox checked={selectedUserIds.has(user.id)} />

              <div class="relative">
                <Avatar.Root class="size-10">
                  <Avatar.Image
                    src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, user.id)}
                  />
                  <Avatar.Fallback>
                    {fallbackAvatarLetters(
                      user.firstName + " " + user.lastName,
                    )}
                  </Avatar.Fallback>
                </Avatar.Root>

                <span
                  class={cn(
                    "rounded-full absolute bottom-0 right-0 size-3 border-2 border-white dark:border-gray-800",
                    {
                      "bg-green-500": user.status === PublicStatus.ONLINE,
                      "bg-yellow-500": user.status === PublicStatus.AWAY,
                      "bg-red-500": user.status === PublicStatus.DO_NOT_DISTURB,
                      "bg-gray-500": user.status === PublicStatus.OFFLINE,
                    },
                  )}
                />
              </div>

              <div class="flex-1">
                <div class="font-medium">
                  {user.firstName}
                  {user.lastName}
                </div>
                <div class="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (showInviteDialog = false)}
        disabled={isInviting}
      >
        Annuler
      </Button>
      <Button
        onclick={inviteMembers}
        disabled={selectedUserIds.size === 0 || isInviting}
        class="flex items-center gap-2"
      >
        {#if isInviting}
          <div
            class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
        {:else}
          <UserPlus size={16} />
        {/if}
        Inviter ({selectedUserIds.size})
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete Message Dialog -->
<AlertDialog.Root bind:open={deleteMessageDialog.open}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Supprimer le message</AlertDialog.Title>
      <AlertDialog.Description>
        Êtes-vous sûr de vouloir supprimer ce message ?
      </AlertDialog.Description>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <Button
        variant="outline"
        onclick={() => (deleteMessageDialog.open = false)}
      >
        Annuler
      </Button>
      <Button
        variant="destructive"
        onclick={() => {
          handleMessageDelete(deleteMessageDialog.message);
        }}
      >
        Supprimer
      </Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<style>
  .sentinel {
    height: 1px;
  }
</style>
