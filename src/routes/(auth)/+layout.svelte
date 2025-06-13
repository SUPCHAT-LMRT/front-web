<script lang="ts">
  import AppSidebar from "$lib/app-sidebar.svelte";
  import Error from "$lib/components/app/icon/Error.svelte";
  import Validate from "$lib/components/app/icon/Validate.svelte";
  import SearchBar from "$lib/components/app/SearchBar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { ModeWatcher } from "mode-watcher";
  import { type Snippet } from "svelte";
  import type { LayoutProps } from "./$types";

  type Props = { children: Snippet } & LayoutProps;

  const { children, data }: Props = $props();

  let authenticatedUser = $state(data.authenticatedUserState);
</script>

<ModeWatcher />

<div class="min-h-[95svh] h-[95svh]">
  <div
    class="flex justify-center p-2 z-10 bg-gray-200 hover:!bg-gray-200 dark:bg-gray-800 hover:dark:!bg-gray-800 border-b dark:border-gray-700"
  >
    <SearchBar />
  </div>

  <Sidebar.Provider class="!min-h-full h-full" style="--sidebar-width: 6rem">
    <AppSidebar bind:authenticatedUserState={authenticatedUser} />
    <div class="w-full overflow-y-auto">
      {@render children?.()}
    </div>
  </Sidebar.Provider>

  <Toaster>
    <Validate slot="success-icon" />
    <Error slot="error-icon" />
  </Toaster>
</div>

<style>
  @reference "$lib/assets/styles/app.css";
  /* Optional: Add some hover effects for results */
  .p-2:hover {
    @apply bg-gray-100 dark:bg-gray-700;
  }

  /* :global is used to prevent purging of these classes */
  :global {
    em {
      @apply bg-yellow-200/80;
    }
  }
</style>
