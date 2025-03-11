<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Skeleton } from "$lib/components/ui/skeleton/index.js";
    import {Input} from "$lib/components/ui/input";
    import {BellIcon, CogIcon, UserIcon, XIcon} from "lucide-svelte";
    import {page} from "$app/state";
    import recentChatsStore from "$lib/stores/recentChatsStore";
    import {StoreResultState} from "$lib/stores/store.svelte";
    import {fallbackAvatarLetters} from "$lib/utils/fallbackAvatarLetters.js";
    import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";

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

    const recentChats = $state(recentChatsStore.get());

    let {children} = $props();
</script>

<div class="flex w-full h-full">
    <Sidebar.Root class="border-l-2 border-r-2 border-gray-200 dark:border-gray-700">
        <Sidebar.Content class="p-4 containerTest z-0 dark:bg-gray-800">
            <Sidebar.Menu class="flex flex-col">
                <Dialog.Root>
                    <Dialog.Trigger
                            class="flex w-full p-1 mb-2  rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 hover:bg-gray-200 transition dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-gray-700 text-sm dark:text-gray-300">Rechercher</span>
                    </Dialog.Trigger>
                    <Dialog.Content class="flex flex-col justify-center items-center max-w-[25rem] dark:bg-gray-800">
                        <Dialog.Header>
                            <Dialog.Title>
                                <Input type="text" placeholder="Où désires-tu aller ?" class="max-w-xs dark:bg-gray-800 dark:focus-visible:bg-red"/>
                            </Dialog.Title>
                            <Dialog.Description class="flex items-center pt-2">
                                <p class="text-[#1C9B4B] font-extrabold text-[11px] uppercase">Conseil de pro :</p>
                                <p class="text-[11px]">
                                    Utiliser
                                    <span class="p-1 bg-gray-200 dark:bg-gray-700 font-bold rounded">@</span>
                                    et
                                    <span class="p-1 bg-gray-200 dark:bg-gray-700  font-bold rounded">#</span>
                                    pour affiner les résultats.
                                </p>
                            </Dialog.Description>
                        </Dialog.Header>
                    </Dialog.Content>
                </Dialog.Root>

                {#each mainItems as item (item.name)}
                    <Sidebar.MenuItem class="mb-2 rounded w-full">
                        <Sidebar.MenuButton
                                class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <a href={item.url} class="flex items-center w-full">
                                <item.icon class="h-6 w-6 text-gray-600 dark:text-gray-300"/>
                                <span class="ml-4 text-gray-700 dark:text-gray-300">{item.name}</span>
                            </a>
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}

                <div class="my-4 border-t border-gray-200 dark:border-gray-700"/>
                <p class="text-xs font-bold p-2 uppercase text-gray-600 dark:text-gray-300">Messages privés</p>

                {#if recentChats.state === StoreResultState.LOADING}
                    {#each Array(13) as _}
                        <Skeleton class="h-8 w-full mb-4" />
                    {/each}
                {:else}
                {#each recentChats.data.recentChats as chat (chat.id)}
                        <Sidebar.MenuItem class="mb-2 rounded w-full {currentChatId === chat.id ? 'bg-gray-200 dark:bg-gray-700' : ''}">
                            <div class="relative group">
                                <div class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <a href="/chat/{chat.kind.toLowerCase()}/{chat.id}" class="flex items-center w-full">
                                        <Avatar.Root class="h-7 w-7">
                                            <Avatar.Image src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, chat.id)} alt={chat.id}
                                                          class="h-full w-full rounded-full object-cover"/>
                                            <Avatar.Fallback
                                                    class="flex items-center justify-center rounded-full h-full w-full">
                                                {fallbackAvatarLetters(chat.name)}
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <span class="ml-4 text-sm text-gray-700 dark:text-inherit">{chat.name}</span>
                                    </a>
                                </div>
                                <button
                                        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:text-gray-300"
                                >
                                    <XIcon class="h-4 w-4"/>
                                </button>
                            </div>
                        </Sidebar.MenuItem>
                    {:else}
                        <span class="text-gray-500 text-md">Aucun chat récent</span>
                    {/each}
                {/if}

            </Sidebar.Menu>
        </Sidebar.Content>
    </Sidebar.Root>

    <div class="h-screen w-full">
        {@render children()}
    </div>
</div>
