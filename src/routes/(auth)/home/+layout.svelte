<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import AppSidebarUser  from "$lib/app-sidebar-content.svelte";

    let { children } = $props();
</script>

<div class="app">

    <Sidebar.Provider >
        <AppSidebarUser />
        <main>
            {@render children?.()}
        </main>
    </Sidebar.Provider>
</div>
