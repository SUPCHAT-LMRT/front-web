<script lang="ts">
  import { page } from "$app/state";
  import { updateGroupName } from "$lib/api/group/group";
  import {
    addGroupMember,
    getGroupInfo,
    removeGroupMember,
    type GroupInfo,
  } from "$lib/api/group/member";
  import { listGroupMessages, type GroupMessage } from "$lib/api/group/message";
  import { RoomKind } from "$lib/api/room";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { listAllUsers, PublicStatus, type User } from "$lib/api/user";
  import ws from "$lib/api/ws";
  import "$lib/assets/styles/chats.scss";
  import HoveredUserProfile from "$lib/components/app/HoveredUserProfile.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Sheet from "$lib/components/ui/sheet";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters";
  import { formatDate } from "$lib/utils/formatDate";
  import { goto } from "$lib/utils/goto";
  import { scrollToBottom } from "$lib/utils/scrollToBottom";
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
    Settings,
    Trash2,
    UserPlus,
    Users,
  } from "lucide-svelte";
  import type { AuthenticatedUserState } from "src/routes/(auth)/authenticatedUser.svelte";
  import { onDestroy, tick } from "svelte";

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
  let currentRoom: { id: string | null; messages: GroupMessage[] } = $state({
    id: null,
    messages: [],
  });

  // Group settings states
  let showGroupSettingsDialog = $state(false);
  let showMembersSheet = $state(false);
  let showInviteDialog = $state(false);
  let newGroupName = $state("");
  let isUpdatingName = $state(false);

  // Invite members states
  let allUsers: User[] = $state([]);
  let selectedUserIds = $state(new Set<string>());
  let isLoadingUsers = $state(false);
  let isInviting = $state(false);

  let unsubscribeSendMessage = null;
  let unsubscribeMessageReactionAdded = null;
  let unsubscribeMessageReactionRemoved = null;
  let unsubscribeUserStatusUpdated = null;
  let unsubscribeGroupMemberAdded = null;
  let unsubscribeGroupMemberRemoved = null;
  let unsubscribeGroupNameUpdated = null;
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
    groupInfo?.members?.find((m) => m.id === authenticatedUser.id)?.isAdmin ||
      false,
  );

  $effect(() => {
    joinRoomAndListenMessages(currentGroupId);
    getGroupInfo(currentGroupId).then((info) => {
      groupInfo = info;
      newGroupName = info.name;
    });

    return () => {
      unsubscribeSendMessage?.();
      unsubscribeMessageReactionAdded?.();
      unsubscribeMessageReactionRemoved?.();
      unsubscribeUserStatusUpdated?.();
      unsubscribeGroupMemberAdded?.();
      unsubscribeGroupMemberRemoved?.();
      unsubscribeGroupNameUpdated?.();
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
      const memberIds = new Set(groupInfo.members.map((m) => m.id));
      allUsers = allUsers.filter((user) => !memberIds.has(user.id));

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
      alert("Veuillez sélectionner au moins un utilisateur à inviter.");
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
      alert("Erreur lors de l'invitation des membres.");
    } finally {
      isInviting = false;
    }
  };

  const updateName = async () => {
    if (!newGroupName.trim() || newGroupName === groupInfo.name) {
      return;
    }

    try {
      isUpdatingName = true;
      await updateGroupName(currentGroupId, newGroupName.trim());
      groupInfo.name = newGroupName.trim();
      showGroupSettingsDialog = false;
    } catch (error) {
      console.error("Failed to update group name:", error);
      alert("Erreur lors de la mise à jour du nom du groupe.");
    } finally {
      isUpdatingName = false;
    }
  };

  const removeMember = async (userId: string) => {
    try {
      await removeGroupMember(currentGroupId, userId);
      // Refresh group info
      groupInfo = await getGroupInfo(currentGroupId);
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Erreur lors de la suppression du membre.");
    }
  };

  const leaveGroup = async () => {
    try {
      await removeGroupMember(currentGroupId, authenticatedUser.id);
      goto("/chat");
    } catch (error) {
      console.error("Failed to leave group:", error);
      alert("Erreur lors de la sortie du groupe.");
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

      unsubscribeGroupNameUpdated = ws.subscribe(
        "group-name-updated",
        (msg) => {
          if (msg.groupId === currentGroupId) {
            groupInfo.name = msg.newName;
            newGroupName = msg.newName;
          }
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
      const newMessages = await getGroupMessages(currentGroupId, {
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
      const newMessages = await getGroupMessages(currentGroupId, {
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

    if (timeDiff > 5 || !lastMessage) {
      currentRoom.messages = await getGroupMessages(currentGroupId, {
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

  const handleLanguageButtonClick = () => {
    window.location.href = `/chat/group/${currentGroupId}/translate`;
  };
</script>

<div class="relative w-full h-full flex flex-col gap-y-4">
  {#if groupInfo}
    <div
      class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4"
    >
      <div class="flex items-center gap-x-3">
        <div class="relative size-12">
          <Avatar.Root class="size-12">
            <Avatar.Image
              src={getS3ObjectUrl(S3Bucket.GROUPS_AVATARS, groupInfo.id)}
            />
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
            {#if isAdmin}
              <DropdownMenu.Item
                onclick={() => (showGroupSettingsDialog = true)}
              >
                <Settings size={16} class="mr-2" />
                Paramètres du groupe
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
            {/if}
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

      {#each currentRoom.messages as message (message.id)}
        <div data-message-id={message.id}>
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
                      {#if groupInfo.members.find((m) => m.id === message.author.userId)?.isAdmin}
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
                        <span
                          class="p-2 rounded-xl break-all bg-primary text-white shadow-lg"
                        >
                          {message.content}
                        </span>
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
                          <span
                            class="p-2 rounded-xl break-all bg-primary text-white shadow-lg w-full"
                          >
                            {message.content}
                          </span>
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
              <ContextMenu.Separator />
              <ContextMenu.Item class="flex justify-between">
                <span>Modifier</span>
                <div>
                  <Pen size="18" />
                </div>
              </ContextMenu.Item>
              <ContextMenu.Item
                class="text-red-500 hover:!bg-red-500 hover:!text-white flex justify-between"
              >
                <span>Supprimer</span>
                <div>
                  <Trash2 size="18" />
                </div>
              </ContextMenu.Item>
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

      <button
        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onclick={handleLanguageButtonClick}
      >
        <Languages size={20} class="text-primary" />
      </button>

      <button
        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onclick={sendMessageToWs}
      >
        <Send size={20} class="text-primary" />
      </button>
    </div>
  {/if}
</div>

<!-- Group Settings Dialog -->
<Dialog.Root bind:open={showGroupSettingsDialog}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Settings size={20} />
        Paramètres du groupe
      </Dialog.Title>
      <Dialog.Description>
        Modifiez les paramètres de votre groupe.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="group-name">Nom du groupe</Label>
        <Input
          id="group-name"
          placeholder="Nom du groupe"
          bind:value={newGroupName}
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (showGroupSettingsDialog = false)}
        disabled={isUpdatingName}
      >
        Annuler
      </Button>
      <Button
        onclick={updateName}
        disabled={!newGroupName.trim() ||
          newGroupName === groupInfo?.name ||
          isUpdatingName}
        class="flex items-center gap-2"
      >
        {#if isUpdatingName}
          <div
            class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
        {:else}
          <Settings size={16} />
        {/if}
        Enregistrer
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

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
                  <div class="font-medium flex items-center gap-2">
                    {member.userName}
                    {#if member.isGroupOwner}
                      <Crown size={14} class="text-yellow-500" />
                    {/if}
                    {#if member.id === authenticatedUser.id}
                      <span class="text-xs text-muted-foreground">(Vous)</span>
                    {/if}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </div>

              {#if isAdmin && member.id !== authenticatedUser.id}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item
                      onclick={() => removeMember(member.id)}
                      class="text-red-600 focus:text-red-600"
                    >
                      Retirer du groupe
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              {/if}
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

<style>
  .sentinel {
    height: 1px;
  }
</style>
