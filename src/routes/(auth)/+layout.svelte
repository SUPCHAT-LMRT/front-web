<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import AppSidebar from "$lib/app-sidebar.svelte";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import Validate from "$lib/components/app/icon/Validate.svelte";
  import Error from "$lib/components/app/icon/Error.svelte";
  import { ModeWatcher } from "mode-watcher";
  import SearchBar from "$lib/components/app/SearchBar.svelte";

  let { children } = $props();
</script>

<ModeWatcher />

<div class="min-h-screen-safe lg:min-h-[95svh] h-screen-safe lg:h-[95svh]">
  <div class="flex justify-center p-2 z-10  bg-gray-200 hover:!bg-gray-200 dark:bg-gray-800 hover:dark:!bg-gray-800">
    <SearchBar />
  </div>

  <Sidebar.Provider class="!min-h-full h-full">
      <AppSidebar />
      {@render children?.()}
  </Sidebar.Provider>

  <Toaster>
    <Validate slot="success-icon" />
    <Error slot="error-icon" />
  </Toaster>
</div>

<style>
    /* Optional: Add some hover effects for results */
    .p-2:hover {
        @apply bg-gray-100 dark:bg-gray-700;
    }

    /* :global is used to prevent purging of these classes */
    :global {
        em {
            @apply bg-yellow-200/20;
        }
    }
</style>