<script lang="ts">
  import { page } from "$app/state";
  import {
    getWorkspaceMembers,
    type WorkspaceMember,
  } from "$lib/api/workspaces/member";
  import HoveredUserProfile from "$lib/components/app/HoveredUserProfile.svelte";
  import * as Pagination from "$lib/components/ui/pagination";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import type { AuthenticatedUserState } from "../../authenticatedUser.svelte";

  const { workspaceId }: { workspaceId: string } = $props();
  const { authenticatedUserState } = page.data as {
    authenticatedUserState: AuthenticatedUserState;
  };

  const authenticatedUser = $derived(authenticatedUserState.user);

  let currentPage = $state(1);
  let totalMembers = $state(0);
  let membersPerPage = 4; // Number of members per page
  let members: WorkspaceMember[] = $state([]);

  $effect(() => {
    getPaginatedWorkspaceMembers(workspaceId, currentPage, membersPerPage);
  });

  const getPaginatedWorkspaceMembers = async (
    workspaceId: string,
    page: number,
    limit: number,
  ) => {
    const response = await getWorkspaceMembers(workspaceId, page, limit); // Assuming you update the API call to accept pagination
    members = response.members;
    totalMembers = response.total;
  };

  const nextPage = () => {
    if (currentPage * membersPerPage < totalMembers) {
      currentPage += 1;
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      currentPage -= 1;
    }
  };
</script>

<div
  class="flex flex-col justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
>
  <div>
    <h2 class="text-lg font-semibold mb-3">Membres</h2>
    <ul>
      {#each members as member, i (i)}
        <li
          class="p-2 dark:border-gray-700"
          class:border-b={i !== members.length - 1}
        >
          <HoveredUserProfile
            userId={member.userId}
            self={member.userId === authenticatedUser.id}
          >
            <div class="text-left">
              <span>
                {member.pseudo}
              </span>
              <span class="text-muted-foreground">
                ({member.email})
              </span>
            </div>
          </HoveredUserProfile>
        </li>
      {/each}
    </ul>
  </div>

  <Pagination.Root
    count={totalMembers}
    perPage={membersPerPage}
    siblingCount={1}
  >
    {#snippet children({ pages, currentPage: currentPaginationPage })}
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton onclick={prevPage}>
            <ChevronLeft class="size-4" />
          </Pagination.PrevButton>
        </Pagination.Item>
        {#each pages as page (page.key)}
          {#if page.type === "ellipsis"}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item>
              <Pagination.Link
                {page}
                isActive={currentPaginationPage === page.value}
                onclick={() => (currentPage = page.value)}
              >
                {page.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton onclick={nextPage}>
            <ChevronRight class="size-4" />
          </Pagination.NextButton>
        </Pagination.Item>
      </Pagination.Content>
    {/snippet}
  </Pagination.Root>
</div>
