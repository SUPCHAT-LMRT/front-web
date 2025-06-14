<script lang="ts">
  import { goto } from "$app/navigation";
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { joinWorkspace } from "$lib/api/workspaces/member";
  import { listWorkspaceDiscover } from "$lib/api/workspaces/workspace";
  import LoadingButton from "$lib/components/ui/loading-button/loading-button.svelte";
  import { error, success } from "$lib/toast/toast";
  import { AxiosError } from "axios";
  import { onMount } from "svelte";
  import { Users } from "lucide-svelte";

  let workspaces = $state([]);
  let joinLoadingWorkspaces = $state([]);
  let failedIcons = $state(new Set());

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

  const handleIconError = (workspaceId: string) => {
    failedIcons = new Set([...failedIcons, workspaceId]);
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

  <div class="text-gray-800 dark:text-white flex-1 py-12 px-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-full mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each workspaces as workspace (workspace.id)}
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div class="h-48 relative overflow-hidden bg-gradient-to-br from-yellow-app to-yellow-app/80">
              <img
                      src="{getS3ObjectUrl(S3Bucket.WORKSPACES_BANNERS, workspace.id)}?{Date.now()}"
                      onerror={function () {
                  this.style.display = "none";
                }}
                      alt={`Workspace banner ${workspace.id}`}
                      class="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute top-3 right-3">
                <div class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {workspace.onlineMembersCount} en ligne
                </div>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mr-3 flex-shrink-0  flex items-center justify-center">
                  {#if failedIcons.has(workspace.id)}
                    <Users class="w-6 h-6 text-yellow-app" />
                  {:else}
                    <img
                            src="{getS3ObjectUrl(S3Bucket.WORKSPACES_ICONS, workspace.id)}?{Date.now()}"
                            alt={`Workspace icon ${workspace.id}`}
                            class="object-cover w-full h-full"
                            onerror={() => handleIconError(workspace.id)}
                    />
                  {/if}
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {workspace.name}
                </h3>
              </div>

              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-16 leading-relaxed line-clamp-3">
                {workspace.topic || "Pas de description fournie."}
              </p>

              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="mr-3">{workspace.onlineMembersCount} en ligne</span>
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
        {/each}
      </div>
    </div>
  </div>
</div>