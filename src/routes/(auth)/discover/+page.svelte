<script lang="ts">
  import { goto } from "$app/navigation";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { joinWorkspace } from "$lib/api/workspaces/member";
  import { listWorkspaceDiscover } from "$lib/api/workspaces/workspace";
  import LoadingButton from "$lib/components/ui/loading-button/loading-button.svelte";
  import { error, success } from "$lib/toast/toast";
  import { AxiosError } from "axios";
  import { onMount } from "svelte";

  let workspaces = $state([]);
  let joinLoadingWorkspaces = $state([]);

  onMount(async () => {
    const result = await listWorkspaceDiscover();
    if (result) {
      workspaces = result;
    }
  });

  const handleJoinWorkspace = async (workspaceId: string) => {
    joinLoadingWorkspaces.push(workspaceId);
    try {
      await joinWorkspace(workspaceId);
      success("Succès", "Vous avez rejoint l'espace de travail avec succès.");
      goto(`/workspaces/${workspaceId}`);
    } catch (e) {
      if (e instanceof AxiosError) {
        error(
          "Erreur",
          e.response?.data.displayError ?? e.response?.data.error,
        );
        return;
      }

      error(
        "Erreur",
        "Une erreur s'est produite lors de la tentative de rejoindre l'espace de travail.",
      );
    } finally {
      joinLoadingWorkspaces = joinLoadingWorkspaces.filter(
        (id) => id !== workspaceId,
      );
    }
  };
</script>

<div class="flex flex-col w-full h-full dark:bg-gray-800">
  <div
    class="bg-gradient-to-r from-primary from-50% to-[#94bfc9] text-white py-16 px-8"
  >
    <div class="max-w-6xl mx-auto">
      <h1 class="text-5xl font-extrabold uppercase tracking-wide mb-6">
        Espace de travail
        <br />
        publics
        <br />
        DE SUPCHAT-LMRT
      </h1>
      <p class="text-gray-300 text-lg max-w-2xl">
        Découvrez des serveurs publics de la communauté SUPCHAT-LMRT. Rejoignez
        des serveurs qui vous intéressent et connectez-vous avec d'autres
        membres de la communauté.
      </p>
    </div>
  </div>
  <div class="text-gray-800 dark:text-white flex-1 py-8 px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each workspaces as workspace (workspace.id)}
        <div
          class="bg-slate-100 dark:bg-[#2a2a2a] rounded-lg shadow-md overflow-hidden"
        >
          <div class="h-40 relative overflow-hidden">
            <img
              src="{getS3ObjectUrl(
                S3Bucket.WORKSPACES_BANNERS,
                workspace.id,
              )}?{Date.now()}"
              onerror={function () {
                this.style.display = "none";
              }}
              alt={`Workspace banner ${workspace.id}`}
              class="object-cover w-full h-full"
            />
          </div>
          <div class="p-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center mb-3">
                <div
                  class="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden relative mr-3 flex-shrink-0"
                >
                  <img
                    src="{getS3ObjectUrl(
                      S3Bucket.WORKSPACES_ICONS,
                      workspace.id,
                    )}?{Date.now()}"
                    alt={`Workspace icon ${workspace.id}`}
                    class="object-cover h-full rounded"
                  />
                </div>
                <h3 class="text-lg font-semibold dark:text-white">
                  {workspace.name}
                </h3>
              </div>

              <p
                class="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[80px]"
              >
                {workspace.topic || "Pas de description fournie."}
              </p>
            </div>

            <div class="flex flex-col gap-y-4">
              <div
                class="flex items-center text-xs text-gray-600 dark:text-gray-400"
              >
                <div class="flex items-center mr-4">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span>{workspace.onlineMembersCount} en ligne</span>
                </div>
                <div class="flex items-center">
                  <span>{workspace.membersCount} membres</span>
                </div>
              </div>
              <LoadingButton
                class="w-full"
                onclick={() => handleJoinWorkspace(workspace.id)}
                loading={joinLoadingWorkspaces.includes(workspace.id)}
              >
                Rejoindre
              </LoadingButton>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
