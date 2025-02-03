<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import AppSidebar from "$lib/app-sidebar.svelte";

    let {children} = $props();
</script>

<div class="app">
    <Sidebar.Provider>
        <div class="flex w-full h-full">
            <AppSidebar/>
            {@render children?.()}
        </div>
    </Sidebar.Provider>
</div>