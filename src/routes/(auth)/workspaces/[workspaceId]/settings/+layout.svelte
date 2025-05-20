<script lang="ts">
  import { page } from "$app/state";
  import * as Tabs from "$lib/components/ui/tabs";
  import { goto } from "$lib/utils/goto";
  import { ArrowLeft } from "lucide-svelte";

  let currentWorkspaceId = $derived(page.params.workspaceId);

  type Tab = {
    displayName: string;
    label: string;
  };

  let activeTab: Tab | null = $state({
    displayName: "Général",
    label: "general",
  });

  switch (page.route.id) {
    case "/(auth)/workspaces/[workspaceId]/settings/general":
      activeTab = { displayName: "Général", label: "general" };
      break;
    case "/(auth)/workspaces/[workspaceId]/settings/confidentiality":
      activeTab = { displayName: "Confidentialité", label: "confidentiality" };
      break;
    case "/(auth)/workspaces/[workspaceId]/settings/postes":
      activeTab = { displayName: "Rôles", label: "roles" };
      break;
  }

  function handleTabChange(tab: Tab, url: string) {
    goto(url);
    activeTab = tab;
  }

  let { children } = $props();
</script>

<section class="border-gray-200 dark:border-gray-800 dark:bg-gray-900 w-full">
  <div class="flex flex-col px-4 py-2">
    <a
      href="/workspaces/{currentWorkspaceId}"
      class="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
    >
      <ArrowLeft size={20} />
      <span>Retour à l'espace de travail</span>
    </a>
    <section>
      <div class="flex items-end mb-4">
        <h1 class="text-3xl font-bold text-gray-700 dark:text-gray-200">
          Paramètres
        </h1>
        <span class="mx-2 mb-1">-</span>
        <span class="text-gray-700 text-lg font-semibold dark:text-gray-200"
          >{activeTab?.displayName}</span
        >
      </div>
    </section>

    <section>
      <div>
        <Tabs.Root value={activeTab?.label}>
          <Tabs.List class="dark:bg-gray-800">
            <Tabs.Trigger
              value="general"
              class="text-gray-600 dark:text-gray-200"
              onclick={() =>
                handleTabChange(
                  { displayName: "Général", label: "general" },
                  `/workspaces/${currentWorkspaceId}/settings/general`,
                )}
            >
              Général
            </Tabs.Trigger>
            <Tabs.Trigger
              value="confidentiality"
              class="text-gray-600 dark:text-gray-200"
              onclick={() =>
                handleTabChange(
                  { displayName: "Confidentialité", label: "confidentiality" },
                  `/workspaces/${currentWorkspaceId}/settings/confidentiality`,
                )}
            >
              Confidentialité
            </Tabs.Trigger>
            <Tabs.Trigger
              value="roles"
              class="text-gray-600 dark:text-gray-200"
              onclick={() =>
                handleTabChange(
                  { displayName: "Rôles", label: "roles" },
                  `/workspaces/${currentWorkspaceId}/settings/roles`,
                )}
            >
              Rôles
            </Tabs.Trigger>
            <Tabs.Trigger
              value="member-management"
              class="text-gray-600 dark:text-gray-200"
              onclick={() =>
                handleTabChange(
                  {
                    displayName: "Gestion des Membres",
                    label: "member-management",
                  },
                  `/workspaces/${currentWorkspaceId}/settings/member-management`,
                )}
            >
              Gestion des Membres
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>
    </section>

    <div class="flex mt-5">
      <div class="w-full max-w-5xl">
        {@render children?.()}
      </div>
    </div>
  </div>
</section>
