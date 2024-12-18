<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";

    const items = [
        {
            name: "Serveur 1",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 2",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 3",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 4",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 5",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 6",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 7",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 8",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 9",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 10",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 11",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 12",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 13",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
        {
            name: "Serveur 14",
            url: "#",
            avatarUrl: "https://github.com/shadcn.png",
        },
    ];
</script>

<Sidebar.Root class="w-24">
    <Sidebar.Content class="!bg-[#E0E0E0]">
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu class="flex flex-col items-center">
                    {#each items as item (item.name)}
                        <Sidebar.MenuItem class="mb-2 rounded w-full flex justify-center">
                            <Sidebar.MenuButton
                                    class="flex items-center justify-center p-2 rounded-full h-16 w-16 transition-all duration-300"
                            >
                                <a href={item.url} class="avatar-link flex items-center justify-center w-full h-full">
                                    <Avatar.Root class="h-12 w-12 ">
                                        <Avatar.Image
                                                src={item.avatarUrl}
                                                alt={item.name}
                                                class="h-full w-full rounded-full object-cover"
                                        />
                                        <Avatar.Fallback class="flex items-center justify-center rounded-full h-full w-full ">
                                            {item.name.slice(0, 2)}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                </a>
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
</Sidebar.Root>
