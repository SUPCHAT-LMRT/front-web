<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    acceptWorkspaceInvitation,
    getWorkspaceInviteLink,
  } from "$lib/api/workspaces/workspace";
  import { onMount } from "svelte";

  let error;
  let workspace;
  let { token } = page.params;

  onMount(async () => {
    try {
      workspace = await getWorkspaceInviteLink(token);
    } catch (e) {
      console.error(e);
      error = "Erreur lors de la récupération des informations du workspace.";
    }
  });

  const handleJoinWorkspace = async () => {
    try {
      await acceptWorkspaceInvitation(token);
      await goto("/workspaces/" + workspace.workspaceId);
    } catch (e) {
      console.error(e);
      error = "Erreur lors de la tentative de rejoindre le workspace.";
    }
  };
</script>

<div class="flex w-full h-screen justify-center items-center">
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md text-center"
  >
    {#if error}
      <p class="text-red-500 font-semibold">{error}</p>
    {:else if workspace}
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        Invitation au workspace {workspace.workspaceName}
      </h1>
      <button
        class="mt-4 bg-primary hover:hover:bg-[#4B7986] text-white font-bold py-2 px-4 rounded-lg"
        onclick={handleJoinWorkspace}
      >
        Rejoindre le Workspace
      </button>
    {:else}
      <p class="text-gray-600 dark:text-gray-400">Chargement...</p>
    {/if}
  </div>
</div>
