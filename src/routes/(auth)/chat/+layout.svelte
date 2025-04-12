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
  import { BellIcon, CogIcon, UserIcon } from "lucide-svelte";
  import { onMount } from "svelte";

  const currentChatId = $derived(page.url.pathname.split("/").pop());

  const mainItems = [
    {
      name: "Profil",
      url: "#",
      icon: UserIcon,
    },
    {
      name: "Paramètres",
      url: "#",
      icon: CogIcon,
    },
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
      };
    }

    return {
      id: chat.id,
      name: chat.name,
      avatarUrl: chat.avatarUrl,
      kind: chat.kind,
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

  let { children } = $props();
</script>

<div class="flex w-full h-full">
  <Sidebar.Root
    class="h-full border-l-2 border-r-2 border-gray-200 dark:border-gray-700"
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
                          src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, chat.id)}
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
                                chat.userStatus === PublicStatus.DO_NOT_DISTURB,
                              "bg-gray-500":
                                chat.userStatus === PublicStatus.OFFLINE,
                            },
                          )}
                        >
                        </span>
                      {/if}
                    </div>
                    <span class="ml-4 text-sm text-gray-700 dark:text-inherit"
                      >{chat.name}</span
                    >
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

  <div class="h-full w-full">
    {@render children()}
  </div>
</div>
