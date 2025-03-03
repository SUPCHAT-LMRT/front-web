<script lang="ts">
    import {getWorkspaceMembers, type WorkspaceMember} from "$lib/api/workspaces/workspace";
    import * as Pagination from "$lib/components/ui/pagination";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    import ChevronLeft from "lucide-svelte/icons/chevron-left";
    import HoveredUserProfile from "$lib/components/app/HoveredUserProfile.svelte";

    const {workspaceId}: { workspaceId: string } = $props();

    let currentPage = $state(1);
    let totalMembers = $state(0);
    let membersPerPage = 4;  // Number of members per page
    let members: WorkspaceMember[] = $state([]);

    $effect(() => {
        getPaginatedWorkspaceMembers(workspaceId, currentPage, membersPerPage);
    })

    const getPaginatedWorkspaceMembers = async (workspaceId: string, page: number, limit: number) => {
        const response = await getWorkspaceMembers(workspaceId, page, limit); // Assuming you update the API call to accept pagination
        members = response.members;
        totalMembers = response.total;
    };

    const nextPage = () => {
        if ((currentPage * membersPerPage) < totalMembers) {
            currentPage += 1;
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            currentPage -= 1;
        }
    };
</script>

<div class="flex flex-col justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <div>
        <h2 class="text-lg font-semibold mb-3">👥 Membres</h2>
        <ul>
            {#each members as member, i (i)}
                <HoveredUserProfile userId={member.userId}>
                    <li class="p-2 dark:border-gray-700" class:border-b={i !== members.length - 1}>
                        {member.pseudo}
                    </li>
                </HoveredUserProfile>
            {/each}
        </ul>
    </div>

    <Pagination.Root count={totalMembers} perPage={membersPerPage} siblingCount={1}>
        {#snippet children({pages, currentPage: currentPaginationPage})}
            <Pagination.Content>
                <Pagination.Item>
                    <Pagination.PrevButton onclick={prevPage}>
                        <ChevronLeft class="size-4"/>
                    </Pagination.PrevButton>
                </Pagination.Item>
                {#each pages as page (page.key)}
                    {#if page.type === "ellipsis"}
                        <Pagination.Item>
                            <Pagination.Ellipsis/>
                        </Pagination.Item>
                    {:else}
                        <Pagination.Item>
                            <Pagination.Link {page} isActive={currentPaginationPage === page.value}
                                             onclick={() => currentPage = page.value}>
                                {page.value}
                            </Pagination.Link>
                        </Pagination.Item>
                    {/if}
                {/each}
                <Pagination.Item>
                    <Pagination.NextButton onclick={nextPage}>
                        <ChevronRight class="size-4"/>
                    </Pagination.NextButton>
                </Pagination.Item>
            </Pagination.Content>
        {/snippet}
    </Pagination.Root>
</div>