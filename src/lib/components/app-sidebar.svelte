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
    ];
</script>

<Sidebar.Root>
    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel class="sidebar-group-label">SupChat</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each items as item (item.name)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton>
                                <a href={item.url} class="avatar-link">
                                    <Avatar.Root>
                                        <Avatar.Image src={item.avatarUrl} alt={item.name} />
                                        <Avatar.Fallback>{item.name.slice(0, 2)}</Avatar.Fallback>
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
