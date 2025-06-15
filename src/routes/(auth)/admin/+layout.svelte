<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import { goto } from "$lib/utils/goto";
  import { page } from "$app/state";
  import { checkUserPermission, JobPermission } from "$lib/api/admin";
  import { AlertTriangle, ArrowLeft } from "lucide-svelte";
  import { authenticatedUserState } from "../authenticatedUser.svelte";

  type Tab = {
    displayName: string;
    label: string;
  };

  let activeTab: Tab | null = $state({
    displayName: "Utilisateurs",
    label: "userList",
  });

  let canViewUsers = $state(false);

  $effect(() => {
    if (authenticatedUserState?.user) {
      checkUserPermission(
        authenticatedUserState.user.id,
        JobPermission.VIEW_ADMINISTRATION_PANEL.permissionBit,
      ).then((hasPermission) => {
        canViewUsers = hasPermission;
      });
    }
  });

  switch (page.route.id) {
    case "/(auth)/admin/users":
      activeTab = { displayName: "Utilisateurs", label: "userList" };
      break;
    case "/(auth)/admin/postes":
      activeTab = { displayName: "Postes", label: "postes" };
      break;
    case "/(auth)/admin/invitations":
      activeTab = { displayName: "Invitations", label: "invitation" };
      break;
  }

  function handleTabChange(tab: Tab, url: string) {
    goto(url);
    activeTab = tab;
  }

  let { children } = $props();
</script>

<section class="border-gray-200 dark:border-gray-800 dark:bg-gray-800 w-full min-h-screen">
  {#if !canViewUsers}
    <div class="space-y-6 m-12">
      <a
        href="/"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
      >
        <ArrowLeft size={20} />
        <span>Retour à l'accueil</span>
      </a>
      <div class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <div class="flex">
          <AlertTriangle class="h-5 w-5 text-red-800 dark:text-red-500" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-500">
              Accès refusé
            </h3>
            <div class="mt-2 text-sm text-red-700 dark:text-red-400">
              <p>
                Vous n'avez pas les permissions nécessaires pour gérer les rôles
                de cet espace de travail.
                <br />
                Veuillez contacter un administrateur si vous pensez qu'il s'agit
                d'une erreur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex flex-col px-4 py-2">
      <section>
        <div class="flex items-end mb-4">
          <h1 class="text-3xl font-bold text-gray-700 dark:text-gray-200">
            Administration
          </h1>
          <span class="mx-2 mb-1">-</span>
          <span class="text-gray-700 text-lg font-semibold dark:text-gray-200"
            >{activeTab.displayName}</span
          >
        </div>
      </section>

      <section>
        <div>
          <Tabs.Root value={activeTab.label}>
            <Tabs.List class="dark:bg-gray-900">
              <Tabs.Trigger
                value="userList"
                class="text-gray-600 dark:text-gray-200"
                onclick={() =>
                  handleTabChange(
                    { displayName: "Utilisateurs", label: "userList" },
                    "/admin/users",
                  )}
              >
                Utilisateurs
              </Tabs.Trigger>
              <Tabs.Trigger
                value="roles"
                class="text-gray-600 dark:text-gray-200"
                onclick={() =>
                  handleTabChange(
                    { displayName: "Postes", label: "postes" },
                    "/admin/postes",
                  )}
              >
                Postes
              </Tabs.Trigger>
              <Tabs.Trigger
                value="invitation"
                class="text-gray-600 dark:text-gray-200"
                onclick={() =>
                  handleTabChange(
                    { displayName: "Invitations", label: "invitation" },
                    "/admin/invitations",
                  )}
              >
                Invitations
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </div>
      </section>
    </div>
    <div class="flex mt-5 ml-5">
      <div class="w-full max-w-5xl">
        {@render children?.()}
      </div>
    </div>
  {/if}
</section>
