<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import workspacesStore from "$lib/stores/workspacesStore";
    import { onMount } from "svelte";

    const workspaces = $state(workspacesStore.get());

    onMount(() => {
        workspacesStore.fetch();
    });
</script>

<Sidebar.Root class="w-24">
    <Sidebar.Content class="!bg-[#E0E0E0] containerTest">
        <Sidebar.Group class="z-0">
            <Sidebar.GroupContent>
                <Sidebar.Menu class="flex flex-col items-center">
                    {#each workspaces.data.workspaces as workspace (workspace.id)}
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Sidebar.MenuItem class="mb-[2px] w-full flex justify-center">
                                    <Sidebar.MenuButton class="flex items-center justify-center p-2 h-16 w-16 transition-all duration-300">
                                        <a href="https://github.com/shadcn.png" class="avatar-link flex items-center justify-center w-full h-full">
                                            <Avatar.Root class="h-12 w-12 rounded-full transition-transform duration-500 hover:rounded-2xl">
                                                <Avatar.Image src="https://github.com/shadcn.png" alt={workspace.name} class="h-full w-full object-cover" />
                                                <Avatar.Fallback class="flex items-center justify-center h-full w-full">
                                                    {workspace.name.slice(0, 2)}
                                                </Avatar.Fallback>
                                            </Avatar.Root>
                                        </a>
                                    </Sidebar.MenuButton>
                                </Sidebar.MenuItem>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>{workspace.name}</p>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
</Sidebar.Root>
