<script lang="ts">
  import { page } from "$app/state";
  import {
    RecentChatKind,
    type RecentChat as RecentChantStore,
  } from "$lib/api/recentChats";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { getUserProfile, PublicStatus } from "$lib/api/user";
  import ws from "$lib/api/ws";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import recentChatsStore from "$lib/stores/recentChatsStore";
  import { StoreResultState, type StoreResult } from "$lib/stores/store.svelte";
  import { cn } from "$lib/utils";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters.js";
  import { goto } from "$lib/utils/goto";
  import { BellIcon } from "@lucide/svelte";
  import { onMount, type Snippet } from "svelte";

  const currentChatId = $derived(page.url.pathname.split("/").pop());

  const mainItems = [
    {
      name: "Notifications",
      url: "#",
      icon: BellIcon,
    },
  ];

  type BaseRecentChat = {
    id: string;
    name: string;
    avatarUrl: string;
    lastMessage?: {
      id: string;
      content: string;
      createdAt: Date;
      authorId: string;
      authorName: string;
    };
  };

  type RecentChat =
    | (BaseRecentChat & {
        kind: Exclude<RecentChatKind, RecentChatKind.DIRECT>;
      })
    | (BaseRecentChat & {
        kind: RecentChatKind.DIRECT;
        userStatus: PublicStatus;
      });

  let recentChats: StoreResult<RecentChat[]> = $state({
    state: StoreResultState.LOADING,
    data: [],
  });

  onMount(async () => {
    recentChats.data = await Promise.all(
      recentChatsStore.get().data.recentChats.map(convertRecentChat),
    );
    recentChats.state = StoreResultState.LOADED;
  });

  $effect(() =>
    ws.subscribe(
      "recent-direct-chat-added",
      async (msg: { otherUserId: string; chatName: string }) => {
        const recentChatStore = {
          id: msg.otherUserId,
          name: msg.chatName,
          avatarUrl: "",
          kind: RecentChatKind.DIRECT,
        } as RecentChantStore;
        recentChatsStore.add(recentChatStore);

        recentChats.data = [
          await convertRecentChat(recentChatStore),
          ...recentChats.data,
        ];
      },
    ),
  );

  $effect(() =>
    ws.subscribe(
      "recent-group-chat-added",
      async (msg: { groupId: string; chatName: string }) => {
        const recentChatStore = {
          id: msg.groupId,
          name: msg.chatName,
          avatarUrl: "",
          kind: RecentChatKind.GROUP,
        } as RecentChantStore;
        recentChatsStore.add(recentChatStore);

        recentChats.data = [
          await convertRecentChat(recentChatStore),
          ...recentChats.data,
        ];
      },
    ),
  );

  $effect(() => {
    return ws.subscribe(
      "recent-group-chat-removed",
      async (msg: { groupId: string }) => {
        recentChatsStore.remove(msg.groupId);
        recentChats.data = recentChats.data.filter(
          (chat) => chat.id !== msg.groupId,
        );
        goto("/chat");
      },
    );
  });

  const convertRecentChat = async (
    chat: RecentChantStore,
  ): Promise<RecentChat> => {
    if (chat.kind === RecentChatKind.DIRECT) {
      const userProfile = await getUserProfile(chat.id);
      return {
        id: chat.id,
        name: chat.name,
        avatarUrl: chat.avatarUrl,
        kind: chat.kind,
        userStatus: userProfile.status,
        lastMessage: chat.lastMessage
          ? {
              id: chat.lastMessage.id,
              content: chat.lastMessage.content,
              createdAt: new Date(chat.lastMessage.createdAt),
              authorId: chat.lastMessage.authorId,
              authorName: chat.lastMessage.authorName,
            }
          : undefined,
      };
    }

    return {
      id: chat.id,
      name: chat.name,
      avatarUrl: chat.avatarUrl,
      kind: chat.kind,
      lastMessage: chat.lastMessage
        ? {
            id: chat.lastMessage.id,
            content: chat.lastMessage.content,
            createdAt: new Date(chat.lastMessage.createdAt),
            authorId: chat.lastMessage.authorId,
            authorName: chat.lastMessage.authorName,
          }
        : undefined,
    };
  };

  $effect(() => {
    return ws.subscribe(
      "user-status-updated",
      (msg: { userId: string; status: PublicStatus }) => {
        recentChats.data = recentChats.data.map((chat) => {
          if (chat.kind === RecentChatKind.DIRECT && chat.id === msg.userId) {
            return { ...chat, userStatus: msg.status };
          }
          return chat;
        });
      },
    );
  });

  $effect(() => {
    const unsubscribeSendMessage = ws.subscribe(
      "send-direct-message",
      async (msg) => {
        await moveChatToTop(msg.otherUserId);
      },
    );

    const unsubscribeMessageReactionAdded = ws.subscribe(
      "direct-message-reaction-added",
      async (msg) => {
        await moveChatToTop(msg.otherUserId);
      },
    );

    const unsubscribeMessageReactionRemoved = ws.subscribe(
      "direct-message-reaction-removed",
      async (msg) => {
        await moveChatToTop(msg.otherUserId);
      },
    );

    return () => {
      unsubscribeSendMessage();
      unsubscribeMessageReactionAdded();
      unsubscribeMessageReactionRemoved();
    };
  });

  const moveChatToTop = (chatId: string) => {
    const chatIndex = recentChats.data.findIndex((chat) => chat.id === chatId);
    if (chatIndex !== -1) {
      const chat = recentChats.data[chatIndex];
      recentChats.data.splice(chatIndex, 1);
      recentChats.data.unshift(chat);
    }
  };

  let { children }: { children: Snippet } = $props();
</script>

<div class="flex w-full h-full">
  <Sidebar.Provider class="!min-h-full h-full w-full flex-1">
    <Sidebar.Root
      class="h-full border-r-2 border-gray-200 dark:border-gray-700 relative"
    >
      <Sidebar.Content class="p-4 containerTest z-0 dark:bg-gray-800">
        <Sidebar.Menu class="flex flex-col">
          {#each mainItems as item (item.name)}
            <Sidebar.MenuItem class="mb-2 rounded w-full">
              <Sidebar.MenuButton
                class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <a href={item.url} class="flex items-center w-full">
                  <item.icon class="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  <span class="ml-4 text-gray-700 dark:text-gray-300"
                    >{item.name}</span
                  >
                </a>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}

          <div class="my-4 border-t border-gray-200 dark:border-gray-700" />
          <p
            class="text-xs font-bold p-2 uppercase text-gray-600 dark:text-gray-300"
          >
            Messages privés
          </p>

          {#if recentChats.state === StoreResultState.LOADING}
            {#each Array(13) as _}
              <Skeleton class="h-8 w-full mb-4" />
            {/each}
          {:else}
            {#each recentChats.data as chat (chat.id)}
              <Sidebar.MenuItem
                class="mb-2 rounded w-full {currentChatId === chat.id
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : ''}"
              >
                <div class="relative group">
                  <div
                    class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <a
                      href="/chat/{chat.kind.toLowerCase()}/{chat.id}"
                      class="flex items-center w-full"
                    >
                      <div class="relative size-7 flex items-center">
                        <Avatar.Root>
                          <Avatar.Image
                            src={getS3ObjectUrl(
                              S3Bucket.USERS_AVATARS,
                              chat.id,
                            )}
                            alt={chat.id}
                            class="h-full w-full rounded-full object-cover"
                          />
                          <Avatar.Fallback
                            class="flex items-center justify-center rounded-full h-full w-full"
                          >
                            {fallbackAvatarLetters(chat.name)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        {#if chat.kind === RecentChatKind.DIRECT}
                          <span
                            class={cn(
                              "rounded-full absolute -bottom-2 -right-3 size-3",
                              {
                                "bg-green-500":
                                  chat.userStatus === PublicStatus.ONLINE,
                                "bg-yellow-500":
                                  chat.userStatus === PublicStatus.AWAY,
                                "bg-red-500":
                                  chat.userStatus ===
                                  PublicStatus.DO_NOT_DISTURB,
                                "bg-gray-500":
                                  chat.userStatus === PublicStatus.OFFLINE,
                              },
                            )}
                          >
                          </span>
                        {/if}
                      </div>
                      <div class="ml-4">
                        <div class="text-sm text-gray-700 dark:text-inherit">
                          {chat.name}
                        </div>
                        {#if chat.lastMessage}
                          {#if chat.lastMessage.authorId !== chat.id}
                            <span class="text-muted-foreground text-sm">
                              {chat.lastMessage.authorName}:
                            </span>
                          {:else}
                            <span class="text-muted-foreground text-sm"
                              >Vous:</span
                            >
                          {/if}
                          {chat.lastMessage.content}
                        {:else}
                          <span class="text-muted-foreground">
                            Aucun message
                          </span>
                        {/if}
                      </div>
                    </a>
                  </div>
                </div>
              </Sidebar.MenuItem>
            {:else}
              <span class="text-gray-500 text-md">Aucun chat récent</span>
            {/each}
          {/if}
        </Sidebar.Menu>
      </Sidebar.Content>
    </Sidebar.Root>
  </Sidebar.Provider>

  <div class="h-full w-full">
    {@render children()}
  </div>
</div>
