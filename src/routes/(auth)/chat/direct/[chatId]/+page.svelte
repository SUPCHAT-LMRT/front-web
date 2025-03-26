<script lang="ts">
  import "$lib/assets/styles/chats.scss";
  import { page } from "$app/state";
  import ws from "$lib/api/ws";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { RoomKind } from "$lib/api/room";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters.js";
  import { getUserProfile, type UserProfile } from "$lib/api/user";
  import { type DirectMessage, getDirectMessages } from "$lib/api/direct/message.js";
  import { onDestroy, tick } from "svelte";
  import { scrollToBottom } from "$lib/utils/scrollToBottom";
  import { cn } from "$lib/utils";
  import { formatDate } from "$lib/utils/formatDate";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import { Tooltip, TooltipContent, TooltipTrigger } from "$lib/components/ui/tooltip";
  import { Pen, Trash2 } from "lucide-svelte";
  import HoveredUserProfile from "$lib/components/app/HoveredUserProfile.svelte";
  import NumberFlow from "@number-flow/svelte";
  import { getWorkspaceChannelMessages } from "$lib/api/workspaces/channels";
  import { goto } from "$lib/utils/goto";

  const { authenticatedUser } = page.data;

  const aroundMessageId = $derived(page.url.searchParams.get("aroundMessageId"));

  // the chatId is the userId of the other user
  let currentChatId = $derived(page.params.chatId);
  let otherUserProfile: UserProfile = $state(null);
  let currentMessage = $state("");
  let currentRoom: { id: string | null, messages: DirectMessage[] } = $state({ id: null, messages: [] });

  let unsubscribeSendMessage = null;
  let unsubscribeMessageReactionAdded = null;
  let unsubscribeMessageReactionRemoved = null;
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
    getUserProfile(currentChatId).then(userProfile => otherUserProfile = userProfile);

    return () => {
      unsubscribeSendMessage?.();
      unsubscribeMessageReactionAdded?.();
      unsubscribeMessageReactionRemoved?.();
      ws.leaveRoom(currentRoom.id);
      currentRoom.id = null;
      currentRoom.messages = [];
    };
  });

  const joinRoomAndListenMessages = async (otherUserId: string) => {
    try {
      currentRoom.messages = await getDirectMessages(otherUserId, {
        limit: LIMIT_LOAD,
        aroundMessageId
      });
      currentRoom.messages = currentRoom.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const joinedRoom = await ws.asyncDirectJoinRoom(otherUserId, RoomKind.DIRECT);
      currentRoom.id = joinedRoom.roomId;

      await tick();
      if (aroundMessageId) {
        const aroundMessageElement = document.querySelector("[data-message-id='" + aroundMessageId + "']");
        if (aroundMessageElement) {
          aroundMessageElement.scrollIntoView({ block: "center" });
        }
      } else {
        await scrollToBottom(elementsList, "auto");
      }

      topObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Quand la sentinelle du haut est visible, on charge les messages précédents
            loadPreviousMessages();
          }
        });
      }, { root: null, threshold: 0.1 });

      bottomObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isAutoScrolling) {
            // Quand la sentinelle du bas est visible, on charge les messages suivants
            loadNextMessages();
          }
        });
      }, { root: null, threshold: 0.1 });

      if (topSentinel) {
        topObserver.observe(topSentinel);
      }
      if (bottomSentinel) {
        bottomObserver.observe(bottomSentinel);
      }

      unsubscribeSendMessage = ws.subscribe("send-direct-message", async (msg) => {
        currentRoom.messages = [
          ...currentRoom.messages,
          {
            id: msg.messageId,
            content: msg.content,
            author: {
              userId: msg.sender.userId,
              firstName: msg.sender.firstName,
              lastName: msg.sender.lastName
            },
            createdAt: new Date(msg.createdAt),
            reactions: []
          }
        ];

        await tick();
        await scrollToBottomSafe(elementsList);
      });

      // Added is triggered when a user adds a reaction to a message,
      // If the reaction already exists, just update the usernames array with the new user, else add the reaction to the message
      unsubscribeMessageReactionAdded = ws.subscribe("direct-message-reaction-added", (msg) => {
        const message = currentRoom.messages.find(m => m.id === msg.messageId);
        if (message) {
          const reaction = message.reactions.find(r => r.reaction === msg.reaction);
          if (reaction) {
            reaction.users = [...reaction.users, { id: msg.member.userId, name: msg.member.username }];
          } else {
            message.reactions = [
              ...message.reactions,
              {
                reaction: msg.reaction,
                users: [{ id: msg.member.userId, name: msg.member.username }]
              }
            ];
          }
        }
      });

      // Removed is triggered when a user removes a reaction from a message,
      // If the reaction exists, remove the user from the usernames array, if the usernames array is empty, remove the reaction from the message
      unsubscribeMessageReactionRemoved = ws.subscribe("direct-message-reaction-removed", (msg) => {
        const message = currentRoom.messages.find(m => m.id === msg.messageId);
        if (message) {
          const reaction = message.reactions.find(r => r.reaction === msg.reaction);
          if (reaction) {
            reaction.users = reaction.users.filter(({ id }) => id !== msg.member.userId);
            if (reaction.users.length === 0) {
              message.reactions = message.reactions.filter(r => r.reaction !== msg.reaction);
            }
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottomSafe = async (element) => {
    if (!element) return;
    isAutoScrolling = true;
    await scrollToBottom(element, "auto");
    setTimeout(() => { isAutoScrolling = false; }, 300); // Petite pause pour éviter le déclenchement immédiat
  };

  // Charge les messages plus anciens (en remontant)
  const loadPreviousMessages = async () => {
    if (currentRoom.messages.length === 0) return;
    try {
      // Le plus ancien message affiché
      const oldest = currentRoom.messages[0];
      const newMessages = await getDirectMessages(currentChatId, {
        limit: LIMIT_LOAD,
        before: oldest.createdAt
      });
      if (newMessages.length > 0) {
        // Ajoute les nouveaux messages au début de la liste
        currentRoom.messages = [...newMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()), ...currentRoom.messages];
        // Si on dépasse le nombre maximum, on retire les messages les plus récents
        while (currentRoom.messages.length > MAX_MESSAGES) {
          currentRoom.messages.pop();
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages précédents:", err);
    }
  };

  // Charge les messages plus récents (en descendant)
  const loadNextMessages = async () => {
    if (currentRoom.messages.length === 0) return;
    try {
      // Le plus récent message affiché
      const newest = currentRoom.messages[currentRoom.messages.length - 1];
      const newMessages = await getDirectMessages(currentChatId, {
        limit: LIMIT_LOAD,
        after: newest.createdAt
      });
      if (newMessages.length > 0) {
        // Ajoute les nouveaux messages à la fin de la liste
        currentRoom.messages = [...currentRoom.messages, ...newMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())];
        // Si on dépasse le nombre maximum, on retire les messages les plus anciens
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
    const timeDiff = lastMessage ? (now.getTime() - lastMessage.createdAt.getTime()) / 1000 / 60 : 0; // Différence en minutes

    ws.sendDirectMessage(currentChatId, currentMessage);
    currentMessage = "";

    // Si l'utilisateur est "loin" dans l'historique (ex. dernier message > 5 min), recharge les messages récents
    if (timeDiff > 5 || !lastMessage) {
      currentRoom.messages = await getDirectMessages(currentChatId, {
        limit: LIMIT_LOAD
      });
      currentRoom.messages = currentRoom.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
  };

  // Set the input placeholder if the input is empty
  $effect(() => {
    if (currentMessage.trim() === "" && inputElement) inputElement.innerText = "";
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
</script>

<div class="relative w-full h-full flex flex-col gap-y-4">
  {#if otherUserProfile}
    <div class="flex items-center gap-x-2 bg-gray-100 dark:bg-gray-800 p-4">
      <span class="font-semibold text-2xl">{otherUserProfile.firstName} {otherUserProfile.lastName}</span>
      <span class="text-gray-500 text-lg translate-y-[1px]">{otherUserProfile.email}</span>
    </div>
  {/if}

  <div class="flex-1 h-full overflow-y-auto px-4 space-y-4 mb-8" bind:this={elementsList}>
    {#if currentRoom.id !== null}
      <!-- Sentinel en haut -->
      <div bind:this={topSentinel} class="sentinel mt-4"></div>

      {#each currentRoom.messages as message (message.id)}
        <div data-message-id={message.id}>
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <div class="flex gap-x-4 items-start"
                   class:justify-end={message.author.userId === authenticatedUser.id}>

                {#snippet messageReaction()}
                  <div class="flex items-center gap-2 mb-4">
                    {#each message.reactions as { reaction, users } (reaction)}
                      <div
                        class={cn("flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-lg gap-x-2 transition-colors duration-300 select-none", {
                                                      "ring-2 ring-primary !bg-primary/30": users.find(({id}) => id === authenticatedUser.id),
                                                  })}
                        onclick={() => handleMessageReactionToggle(message.id, reaction)}
                        role="button" tabindex="-1">
                        <span>{reaction}</span>
                        <NumberFlow
                          spinTiming={{duration: 150}}
                          value={users.length} />
                      </div>
                    {/each}
                  </div>
                {/snippet}

                {#if message.author !== null && message.author.userId !== authenticatedUser.id}
                  <HoveredUserProfile userId={message.author.userId} self={false}>
                    <Avatar.Root class="flex-shrink-0">
                      <Avatar.Image
                        src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)} />
                      <Avatar.Fallback>{fallbackAvatarLetters(message.author.firstName + " " + message.author.lastName)}</Avatar.Fallback>
                    </Avatar.Root>
                  </HoveredUserProfile>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <HoveredUserProfile userId={message.author.userId} self={false}>
                        <span class="font-semibold">{message.author.firstName} {message.author.lastName}</span>
                      </HoveredUserProfile>
                      <Tooltip>
                        <TooltipTrigger>
                                                  <span class="text-sm text-gray-500">
                                                      {formatDate(message.createdAt)}
                                                  </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(new Date(message.createdAt), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div class="flex flex-col gap-y-2">
                      <div class="flex items-center gap-2">
                                              <span class="p-2 rounded-xl break-all bg-primary text-white shadow-lg">
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
                              {format(new Date(message.createdAt), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                            </TooltipContent>
                          </Tooltip>
                          <span class="p-2 rounded-xl break-all bg-primary text-white shadow-lg w-full">
                                                      {message.content}
                                                  </span>
                        </div>

                        <HoveredUserProfile userId={message.author.userId} self={true}>
                          <Avatar.Root class="flex-shrink-0 -translate-y-[2px] -p-[2px]">
                            <Avatar.Image
                              src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)} />
                            <Avatar.Fallback>{fallbackAvatarLetters(message.author.firstName + " " + message.author.lastName)}</Avatar.Fallback>
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
              <ContextMenu.Item class="flex justify-between hover:!bg-white dark:hover:!bg-popover">
                {#each ["😊", "😂", "🤷‍♂️", "👍"] as emoji}
                  <div
                    class="flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors duration-300 p-2 rounded-full w-8 h-8 text-lg"
                    onclick={() => handleMessageReactionToggle(message.id, emoji)}
                    role="button" tabindex="-1">
                    {emoji}
                  </div>
                {/each}
              </ContextMenu.Item>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger>Ajouter une réaction</ContextMenu.SubTrigger>
                <ContextMenu.SubContent class="min-w-max">
                  {#each ["😉", "😎", "😢"] as emoji}
                    <ContextMenu.Item
                      class="text-lg"
                      onclick={() => handleMessageReactionToggle(message.id, emoji)}
                      role="button" tabindex={-1}>
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
              <ContextMenu.Item class="text-red-500 hover:!bg-red-500 hover:!text-white flex justify-between">
                <span>Supprimer</span>
                <div>
                  <Trash2 size="18" />
                </div>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        </div>
      {/each}

      <!-- Sentinel en bas -->
      <div bind:this={bottomSentinel} class="sentinel mb-4"></div>
    {/if}
  </div>

  {#if otherUserProfile}
    <div
      class="absolute bottom-0 p-2 border-none border-t-[2px] bg-gray-100 dark:bg-gray-800 border-t-primary max-h-12 overflow-y-auto w-full break-all cursor-text"
      contenteditable
      placeholder="Écrivez un message à {otherUserProfile.firstName} {otherUserProfile.lastName}"
      bind:this={inputElement}
      bind:innerText={currentMessage}
      onkeydown={handleInputKeyDown}
    ></div>
  {/if}
</div>

<style>
    .sentinel {
        height: 1px;
    }
</style>