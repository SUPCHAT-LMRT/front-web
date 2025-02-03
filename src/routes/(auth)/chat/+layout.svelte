<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as Dialog from "$lib/components/ui/dialog";
    import {Input} from "$lib/components/ui/input";
    import {BellIcon, CogIcon, UserIcon, XIcon} from "lucide-svelte";
    import recentChatsStore from "$lib/stores/recentChatsStore";
    import {onMount} from "svelte";
    import {page} from "$app/state";

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
    let isLoading = $state(true);

    onMount(() => {
        try {
            recentChatsStore.fetch();
            isLoading = false;
        } catch (error) {
            console.error("Erreur lors de la récupération des chats récents :", error);
        }
    });

    let {children} = $props();
</script>

<div class="flex w-full h-full">
    <Sidebar.Root class="border-l-2 border-r-2 border-gray-200">
    <Sidebar.Content class="p-4 containerTest z-0">
        <Sidebar.Menu class="flex w-52 flex-col">
            <Dialog.Root>
                <Dialog.Trigger
                        class="flex w-full p-1 mb-2  rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 hover:bg-gray-200 transition">
                    <span class="text-gray-700 text-sm">Rechercher...</span>
                </Dialog.Trigger>
                <Dialog.Content class="flex flex-col justify-center items-center max-w-[25rem]">
                    <Dialog.Header>
                        <Dialog.Title>
                            <Input type="text" placeholder="Où désires-tu aller ?" class="max-w-xs"/>
                        </Dialog.Title>
                        <Dialog.Description class="flex items-center space-x-1">
                            <p class="text-[#1C9B4B] font-extrabold text-[11px] uppercase">Conseil de pro :</p>
                            <p class="text-[11px]">
                                Utiliser
                                <span class="p-1 bg-gray-200 font-bold rounded">@</span>
                                et
                                <span class="p-1 bg-gray-200 font-bold rounded">#</span>
                                pour affiner les résultats.
                            </p>
                        </Dialog.Description>
                    </Dialog.Header>
                </Dialog.Content>
            </Dialog.Root>

            {#each mainItems as item (item.name)}
                <Sidebar.MenuItem class="mb-2 rounded w-full">
                    <Sidebar.MenuButton
                            class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-100">
                        <a href={item.url} class="flex items-center w-full">
                            <item.icon class="h-6 w-6 text-gray-600"/>
                            <span class="ml-4 text-gray-700">{item.name}</span>
                        </a>
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            {/each}

            <div class="my-4 border-t border-gray-200"></div>
            <p class="text-xs font-bold p-2 uppercase">Message privés</p>

            {#if isLoading}
                <span class="text-3xl text-red-600 underline"> ⚠️ SKELETON A FAIRE</span>
            {:else}
                {#each recentChats.data.recentChats as chat (chat.id)}
                    <Sidebar.MenuItem class="mb-2 rounded w-full {currentChatId === chat.id ? 'bg-gray-200' : ''}">
                        <div class="relative group">
                            <div class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-200">
                                <a href="/chat/{chat.kind}/{chat.id}" class="flex items-center w-full">
                                    <Avatar.Root class="h-9 w-9">
                                        <Avatar.Image src={chat.avatarUrl} alt={chat.id}
                                                      class="h-full w-full rounded-full object-cover"/>
                                        <Avatar.Fallback
                                                class="flex items-center justify-center rounded-full h-full w-full">
                                            {chat.name.slice(0, 2)}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                    <span class="ml-4 text-gray-700">{chat.name}</span>
                                </a>
                            </div>
                            <button
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <XIcon class="h-4 w-4"/>
                            </button>
                        </div>
                    </Sidebar.MenuItem>
                {/each}
            {/if}

        </Sidebar.Menu>
    </Sidebar.Content>
</Sidebar.Root>


{@render children()}
</div>
