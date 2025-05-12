<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs";
    import {goto} from "$lib/utils/goto";
    import {page} from "$app/state";

    type Tab = {
        displayName: string;
        label: string;
    }

    let activeTab: Tab | null = $state({
        displayName: "Utilisateurs",
        label: "userList"
    });

    switch (page.route.id) {
        case "/(auth)/admin/users":
            activeTab = {displayName: "Utilisateurs", label: "userList"};
            break;
        case "/(auth)/admin/postes":
            activeTab = {displayName: "Postes", label: "postes"};
            break;
        case "/(auth)/admin/invitations":
            activeTab = {displayName: "Invitations", label: "invitation"};
            break;
    }

    function handleTabChange(tab: Tab, url: string) {
        goto(url);
        activeTab = tab;
    }

    let {children} = $props();
</script>

<section class="ml-15 border-l-2 border-gray-200 dark:border-gray-800 dark:bg-gray-800 w-full">
    <div class="flex flex-col px-4 py-2">
        <section>
            <div class="flex items-end mb-4">
                <h1 class="text-3xl font-bold text-gray-700 dark:text-gray-200">Paramètres</h1>
                <span class="mx-2 mb-1">-</span>
                <span class="text-gray-700 text-lg font-semibold dark:text-gray-200">{activeTab.displayName}</span>
            </div>
        </section>

        <section>
            <div>
                <Tabs.Root value={activeTab.label}>
                    <Tabs.List class="ml-auto dark:bg-gray-900">
                        <Tabs.Trigger value="userList" class="text-gray-600 dark:text-gray-200" onclick={() => handleTabChange({displayName: "Utilisateurs", label: "userList"}, "/admin/users")}>
                            Utilisateurs
                        </Tabs.Trigger>
                        <Tabs.Trigger value="roles" class="text-gray-600 dark:text-gray-200" onclick={() => handleTabChange({displayName: "Postes", label: "postes"}, "/admin/postes")}>
                            Postes
                        </Tabs.Trigger>
                        <Tabs.Trigger value="invitation" class="text-gray-600 dark:text-gray-200" onclick={() => handleTabChange({displayName: "Invitations", label: "invitation"}, "/admin/invitations")}>
                            Invitations
                        </Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>
            </div>
        </section>
    </div>
    <div class="flex mt-5">
        <div class="w-full max-w-5xl">
            {@render children?.()}
        </div>
    </div>
</section>