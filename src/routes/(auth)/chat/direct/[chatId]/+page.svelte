<script lang="ts">
  import { page } from "$app/state";
  import { smartFly } from "$lib/animation/visibleFly";
  import {
    getDirectMessages,
    type DirectMessage,
  } from "$lib/api/direct/message.js";
  import { createGroupChat } from "$lib/api/group/group";
  import { RoomKind } from "$lib/api/room";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import {
    getUserProfile,
    listAllUsers,
    PublicStatus,
    type ListAllUsersResponse,
    type UserProfile,
  } from "$lib/api/user";
  import ws from "$lib/api/ws";
  import "$lib/assets/styles/chats.css";
  import HoveredUserProfile from "$lib/components/app/HoveredUserProfile.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters.js";
  import { formatDate } from "$lib/utils/formatDate";
  import { goto } from "$lib/utils/goto";
  import { scrollToBottom } from "$lib/utils/scrollToBottom";
  import NumberFlow from "@number-flow/svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import { Languages, Pen, Send, Trash2, Users } from "lucide-svelte";
  import type { AuthenticatedUserState } from "src/routes/(auth)/authenticatedUser.svelte";
  import { onDestroy, tick } from "svelte";
  import { SvelteSet } from "svelte/reactivity";

  type CustomDirectMessage = DirectMessage & {
    editMode?: boolean;
    editInputElement?: HTMLDivElement;
  };

  const { authenticatedUserState } = page.data as {
    authenticatedUserState: AuthenticatedUserState;
  };

  const authenticatedUser = $derived(authenticatedUserState.user);

  const aroundMessageId = $derived(
    page.url.searchParams.get("aroundMessageId"),
  );

  // the chatId is the userId of the other user
  let currentChatId = $derived(page.params.chatId);
  let otherUserProfile: UserProfile = $state(null);
  let currentMessage = $state("");
  let currentRoom: { id: string | null; messages: CustomDirectMessage[] } =
    $state({
      id: null,
      messages: [],
    });

  let deleteMessageDialog: {
    open: boolean;
    message: CustomDirectMessage | null;
  } = $state({
    open: false,
    message: null,
  });

  // Group creation states
  let showCreateGroupDialog = $state(false);
  let allUsers: ListAllUsersResponse[] = $state([]);
  let selectedUserIds = $state(new SvelteSet<string>());
  let groupName = $state("");
  let isLoadingUsers = $state(false);
  let isCreatingGroup = $state(false);

  let unsubscribeSendMessage = null;
  let unsubscribeMessageReactionAdded = null;
  let unsubscribeMessageReactionRemoved = null;
  let unsubscribeUserStatusUpdated = null;
  let unsubscribeGroupMessageContentEdited = null;
  let unsubscribeGroupMessageDeleted = null;
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

  $effect(() => {
    joinRoomAndListenMessages(currentChatId);
    getUserProfile(currentChatId).then(
      (userProfile) => (otherUserProfile = userProfile),
    );

    return () => {
      unsubscribeSendMessage?.();
      unsubscribeMessageReactionAdded?.();
      unsubscribeMessageReactionRemoved?.();
      unsubscribeUserStatusUpdated?.();
      unsubscribeGroupMessageContentEdited?.();
      unsubscribeGroupMessageDeleted?.();
      ws.leaveRoom(currentRoom.id);
      currentRoom.id = null;
      currentRoom.messages = [];
    };
  });

  // Load all users when dialog opens
  $effect(() => {
    if (showCreateGroupDialog) {
      loadAllUsers();
    }
  });

  const loadAllUsers = async () => {
    try {
      isLoadingUsers = true;
      allUsers = await listAllUsers();

      // Pre-select the current chat user and authenticated user
      selectedUserIds = new SvelteSet([authenticatedUser.id, currentChatId]);

      // Set default group name
      if (otherUserProfile) {
        groupName = `Groupe avec ${otherUserProfile.firstName} ${otherUserProfile.lastName}`;
      }
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
  };

  const createGroup = async () => {
    if (selectedUserIds.size < 2) {
      alert("Un groupe doit contenir au moins 2 personnes.");
      return;
    }

    if (!groupName.trim()) {
      alert("Veuillez entrer un nom pour le groupe.");
      return;
    }

    try {
      isCreatingGroup = true;

      const newGroupId = await createGroupChat(
        groupName.trim(),
        Array.from(selectedUserIds),
      );

      console.log("Creating group with:", {
        name: groupName.trim(),
        memberIds: Array.from(selectedUserIds),
      });

      goto(`/chat/group/${newGroupId}`);

      showCreateGroupDialog = false;
      resetGroupCreationState();
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Erreur lors de la création du groupe.");
    } finally {
      isCreatingGroup = false;
    }
  };

  const resetGroupCreationState = () => {
    selectedUserIds = new SvelteSet();
    groupName = "";
    allUsers = [];
  };

  const joinRoomAndListenMessages = async (otherUserId: string) => {
    try {
      currentRoom.messages = await getDirectMessages(otherUserId, {
        limit: LIMIT_LOAD,
        aroundMessageId,
      });
      currentRoom.messages = currentRoom.messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      const joinedRoom = await ws.asyncDirectJoinRoom(
        otherUserId,
        RoomKind.DIRECT,
      );
      currentRoom.id = joinedRoom.roomId;

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
        "send-direct-message",
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
        "direct-message-reaction-added",
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
        "direct-message-reaction-removed",
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

      unsubscribeUserStatusUpdated = ws.subscribe(
        "user-status-updated",
        (msg) => {
          if (msg.userId === otherUserProfile.id) {
            otherUserProfile.status = msg.status;
          }
        },
      );

      unsubscribeGroupMessageContentEdited = ws.subscribe(
        "direct-message-content-edited",
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
        "direct-message-deleted",
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
      const newMessages = await getDirectMessages(currentChatId, {
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
      const newMessages = await getDirectMessages(currentChatId, {
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
    ws.toggleDirectMessageReaction(currentChatId, messageId, reaction);
  };

  const sendMessageToWs = async () => {
    if (currentMessage.trim() === "") return;

    const now = new Date();
    const lastMessage = currentRoom.messages[currentRoom.messages.length - 1];
    const timeDiff = lastMessage
      ? (now.getTime() - lastMessage.createdAt.getTime()) / 1000 / 60
      : 0;

    ws.sendDirectMessage(currentChatId, currentMessage);
    currentMessage = "";

    if (timeDiff > 5) {
      currentRoom.messages = await getDirectMessages(currentChatId, {
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
    window.location.href = `/chat/direct/${currentChatId}/translate`;
  };

  const handleMessageEdit = async (message: CustomDirectMessage) => {
    // Toggle edit mode
    message.editMode = !message.editMode;
    if (message.editMode) {
      await tick(); // Wait for the DOM to update
      // Focus the input element if entering edit mode
      message.editInputElement?.focus();
    } else {
      // Send the edited message
      ws.editDirectMessage(currentChatId, message.id, message.content);
    }
  };

  const handleMessageDelete = async (message: CustomDirectMessage) => {
    if (!message) return;

    try {
      await ws.deleteDirectMessage(currentChatId, message.id);
    } catch (error) {
      console.error("Failed to delete message:", error);
      error(
        "Erreur lors de la suppression du message.",
        "Impossible de supprimer le message, veuillez réessayer plus tard.",
      );
    }
  };
</script>

<div class="relative w-full h-full flex flex-col gap-y-4">
  {#if otherUserProfile}
    <div
      class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4"
    >
      <div class="flex items-center gap-x-2">
        <div class="relative size-12">
          {#key otherUserProfile}
            <Avatar.Root>
              <Avatar.Image
                src={getS3ObjectUrl(
                  S3Bucket.USERS_AVATARS,
                  otherUserProfile.id,
                )}
              />
              <Avatar.Fallback
                >{fallbackAvatarLetters(
                  otherUserProfile.firstName + " " + otherUserProfile.lastName,
                )}</Avatar.Fallback
              >
            </Avatar.Root>
          {/key}
          <span
            class={cn("rounded-full absolute bottom-2 right-2 size-3", {
              "bg-green-500": otherUserProfile.status === PublicStatus.ONLINE,
              "bg-yellow-500": otherUserProfile.status === PublicStatus.AWAY,
              "bg-red-500":
                otherUserProfile.status === PublicStatus.DO_NOT_DISTURB,
              "bg-gray-500": otherUserProfile.status === PublicStatus.OFFLINE,
            })}
          >
          </span>
        </div>

        <span class="font-semibold text-2xl"
          >{otherUserProfile.firstName} {otherUserProfile.lastName}</span
        >
        <span class="text-gray-500 text-lg translate-y-[1px]"
          >{otherUserProfile.email}</span
        >
      </div>

      <Button
        variant="outline"
        size="sm"
        onclick={() => (showCreateGroupDialog = true)}
        class="flex items-center gap-2"
      >
        <Users size={16} />
        Créer un groupe
      </Button>
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
                      <Avatar.Fallback
                        >{fallbackAvatarLetters(
                          message.author.firstName +
                            " " +
                            message.author.lastName,
                        )}</Avatar.Fallback
                      >
                    </Avatar.Root>
                  </HoveredUserProfile>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <HoveredUserProfile
                        userId={message.author.userId}
                        self={false}
                      >
                        <span class="font-semibold"
                          >{message.author.firstName}
                          {message.author.lastName}</span
                        >
                      </HoveredUserProfile>
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
                            <span
                              class="p-2 rounded-xl break-all bg-primary text-white shadow-lg w-full"
                            >
                              {message.content}
                            </span>
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
                            <Avatar.Fallback
                              >{fallbackAvatarLetters(
                                message.author.firstName +
                                  " " +
                                  message.author.lastName,
                              )}</Avatar.Fallback
                            >
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
                  onclick={() => handleMessageEdit(message)}
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

  {#if otherUserProfile}
    <div
      class="flex items-center gap-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-t-[2px] border-t-primary"
    >
      <div
        class="flex-1 p-2 rounded-lg bg-white dark:bg-gray-700 min-h-[40px] max-h-32 overflow-y-auto break-all cursor-text"
        contenteditable
        placeholder="Écrivez un message à {otherUserProfile.firstName}"
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

<!-- Create Group Dialog -->
<Dialog.Root bind:open={showCreateGroupDialog}>
  <Dialog.Content class="max-w-2xl max-h-[80vh]">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Users size={20} />
        Créer un nouveau groupe
      </Dialog.Title>
      <Dialog.Description>
        Sélectionnez les utilisateurs que vous souhaitez ajouter au groupe.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-6 py-4">
      <!-- Group Name Input -->
      <div class="space-y-2">
        <Label for="group-name">Nom du groupe</Label>
        <Input
          id="group-name"
          placeholder="Entrez le nom du groupe..."
          bind:value={groupName}
        />
      </div>

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
              onclick={() =>
                user.id !== authenticatedUser.id &&
                toggleUserSelection(user.id)}
            >
              <Checkbox
                checked={selectedUserIds.has(user.id)}
                disabled={user.id === authenticatedUser.id}
              />

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
                  {#if user.id === authenticatedUser.id}
                    <span class="text-xs text-muted-foreground">(Vous)</span>
                  {/if}
                  {#if user.id === currentChatId}
                    <span class="text-xs text-primary"
                      >(Discussion actuelle)</span
                    >
                  {/if}
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
        onclick={() => (showCreateGroupDialog = false)}
        disabled={isCreatingGroup}
      >
        Annuler
      </Button>
      <Button
        onclick={createGroup}
        disabled={selectedUserIds.size < 2 ||
          !groupName.trim() ||
          isCreatingGroup}
        class="flex items-center gap-2"
      >
        {#if isCreatingGroup}
          <div
            class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
        {:else}
          <Users size={16} />
        {/if}
        Créer le groupe
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
