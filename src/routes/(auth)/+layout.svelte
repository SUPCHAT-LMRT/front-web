<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import AppSidebar from "$lib/app-sidebar.svelte";
    import { Toaster } from "$lib/components/ui/sonner/index.js";
    import Validate from "$lib/components/app/icon/Validate.svelte";
    import Error from "$lib/components/app/icon/Error.svelte";

    let {children} = $props();
</script>

<div class="app">
    <Sidebar.Provider>
        <div class="flex w-full h-full">
            <AppSidebar/>
            {@render children?.()}
        </div>
    </Sidebar.Provider>
    <Toaster>
        <Validate slot="success-icon" />
        <Error slot="error-icon" />
    </Toaster>
</div>