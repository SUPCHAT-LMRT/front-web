<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import AppSidebar from "$lib/app-sidebar.svelte";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import Validate from "$lib/components/app/icon/Validate.svelte";
  import Error from "$lib/components/app/icon/Error.svelte";
  import { ModeWatcher } from "mode-watcher";
  import { Input } from "$lib/components/ui/input";
  import { baseClient } from "$lib/api/client";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { cn } from "$lib/utils";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters";

  let { children } = $props();

  // Define TypeScript types matching your API
  type SearchResultKind = "channel" | "message";

  interface SearchResult {
    kind: SearchResultKind;
    data: SearchResultChannel | SearchResultMessage;
  }

  interface SearchResultChannel {
    id: string;
    name: string;
    topic: string;
    href: string;
  }

  interface SearchResultMessage {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    href: string;
  }

  const listSearchResults = async (term: string): Promise<SearchResult[]> => {
    if (term === "") return [];
    try {
      const response = await baseClient.get(`/api/search?q=${term}&kind=${kindFilter ?? ""}`);
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  let dialogSearchOpen = $state(false);
  let searchQuery = $state("");
  let kindFilter = $state<SearchResultKind | null>(null);
  let searchResults = $derived(listSearchResults(searchQuery));

  const closeDialogSearch = () => {
    dialogSearchOpen = false;
    searchQuery = "";
  };
</script>

<ModeWatcher />

<div>
  <div class="flex justify-center p-2 z-10  bg-gray-200 hover:!bg-gray-200 dark:bg-gray-800 hover:dark:!bg-gray-800">
    <Dialog.Root bind:open={dialogSearchOpen}>
      <Dialog.Trigger
        class="flex items-center w-1/3 px-2 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 hover:bg-gray-200 transition dark:bg-gray-700 dark:border-gray-600"
      >
        <span class="text-gray-700 text-sm dark:text-gray-300">Rechercher</span>
      </Dialog.Trigger>
      <Dialog.Content class="flex flex-col justify-center items-center max-w-[30rem] dark:bg-gray-800">
        <Dialog.Header>
          <Dialog.Title class="relative">
            <Input
              type="text"
              placeholder="Que souhaites-tu chercher ?"
              bind:value={searchQuery}
              class="max-w-xs dark:bg-gray-800 border border-gray-400 dark:focus-visible:bg-red"
            />
          </Dialog.Title>
          <Dialog.Description class="flex items-center pt-2">
            <p class="text-[#1C9B4B] font-extrabold text-[11px] uppercase">Conseil de pro :</p>
            <p class="text-[11px]">
              Utilise
              <button
                class={cn("p-1 bg-gray-200 dark:bg-gray-700 font-bold rounded", kindFilter === "message" && "!bg-green-500 text-white")}
                onclick={() => kindFilter = (kindFilter === "message" ? null : "message")}>
                Message
              </button>
              et
              <button
                class={cn("p-1 bg-gray-200 dark:bg-gray-700 font-bold rounded", kindFilter === "channel" && "!bg-green-500 text-white")}
                onclick={() => kindFilter = (kindFilter === "channel" ? null : "channel")}>
                Channel
              </button>
              pour affiner les résultats.
            </p>
          </Dialog.Description>
        </Dialog.Header>

        {#await searchResults}
          <div class="mt-4">
            <Skeleton class="h-8 w-full" />
            <Skeleton class="h-8 w-full" />
            <Skeleton class="h-8 w-full" />
          </div>
        {:then results}
          <!-- Search Results Display -->
          {#if results.length > 0}
            <div class="w-full max-h-60 overflow-y-auto mt-4">
              {#each results as result}
                <a href={result.data.href}
                   class="block p-2 border-b rounded-sm hover:!bg-gray-600 border-gray-200 dark:border-gray-700"
                   onclick={closeDialogSearch}>
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {result.kind}
                  </span>
                  {#if result.kind === "channel"}
                      <span class="text-sm block">
                        {@html result.data.name} ({@html result.data.topic})
                      </span>
                  {:else if result.kind === "message"}
                      <div>
                        <div class="flex items-center gap-x-2">
                          <Avatar.Root class="flex-shrink-0">
                            <Avatar.Image
                              src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, result.data.authorId)} />
                            <Avatar.Fallback>{fallbackAvatarLetters(result.data.authorName)}</Avatar.Fallback>
                          </Avatar.Root>
                          <span>{result.data.authorName}</span>
                        </div>

                        <span class="mt-4 text-sm">{@html result.data.content}</span>
                      </div>
                  {/if}
                </a>
              {/each}
            </div>
          {:else if searchQuery}
            <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Aucun résultat trouvé
            </div>
          {/if}
        {/await}

      </Dialog.Content>
    </Dialog.Root>
  </div>

  <Sidebar.Provider class="!min-h-[95svh] h-[95svh]">
    <div class="flex w-full h-full">
      <AppSidebar />
      {@render children?.()}
    </div>
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