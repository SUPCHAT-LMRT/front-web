<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import {BellIcon, CogIcon, UserIcon, XIcon} from "lucide-svelte";

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

    const users = [
        { name: "Alice", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Bob", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Charlie", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "David", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Eve", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Frank", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Grace", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Hank", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Ivy", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Jack", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Kathy", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Leo", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Mona", url: "#", avatarUrl: "https://github.com/shadcn.png" },
        { name: "Nina", url: "#", avatarUrl: "https://github.com/shadcn.png" },
    ];
</script>

<Sidebar.Root class="w-64 ml-24 border-l-2 border-r-2 border-gray-200 ">
    <Sidebar.Content class="p-4 containerTest z-0">
        <Sidebar.Menu class="flex flex-col">
            <Dialog.Root>
                <Dialog.Trigger class="flex w-full p-1 mb-2  rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 hover:bg-gray-200 transition">
                    <span class="text-gray-700 text-sm">Rechercher...</span>
                </Dialog.Trigger>
                <Dialog.Content class="flex flex-col justify-center items-center max-w-[25rem]">
                    <Dialog.Header>
                        <Dialog.Title>
                            <Input type="text" placeholder="Où désires-tu aller ?" class="max-w-xs" />
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
                    <Sidebar.MenuButton class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-100">
                        <a href={item.url} class="flex items-center w-full">
                            <svelte:component this={item.icon} class="h-6 w-6 text-gray-600" />
                            <span class="ml-4 text-gray-700">{item.name}</span>
                        </a>
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            {/each}

            <div class="my-4 border-t border-gray-200"></div>
            <p class="text-xs font-bold p-2 uppercase">Message privés</p>

            {#each users as user (user.name)}
                <Sidebar.MenuItem class="mb-2 rounded w-full">
                    <div class="relative group">
                        <div class="flex items-center p-2 rounded transition-all duration-300 hover:bg-gray-200">
                            <a href={user.url} class="flex items-center w-full">
                                <Avatar.Root class="h-9 w-9">
                                    <Avatar.Image src={user.avatarUrl} alt={user.name} class="h-full w-full rounded-full object-cover" />
                                    <Avatar.Fallback class="flex items-center justify-center rounded-full h-full w-full">
                                        {user.name.slice(0, 2)}
                                    </Avatar.Fallback>
                                </Avatar.Root>
                                <span class="ml-4 text-gray-700">{user.name}</span>
                            </a>
                        </div>
                        <button
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            <XIcon class="h-4 w-4" />
                        </button>
                    </div>
                </Sidebar.MenuItem>
            {/each}
        </Sidebar.Menu>
    </Sidebar.Content>
</Sidebar.Root>

