<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs";
    import Language from "$lib/components/app/settings/Language.svelte";
    import Account from "$lib/components/app/settings/Account.svelte";
    import Connection from "$lib/components/app/settings/Connection.svelte";

    let activeTab = "Mon compte";

    function handleTabChange(value: string) {
        activeTab = value;
    }
</script>

<section class="pl-40">
    <Tabs.Root>
        <div class="flex flex-col px-4 py-2">
            <section>
                <div class="flex items-end mb-4">
                    <h1 class="text-3xl font-bold text-gray-700">Paramètre</h1>
                    <span class="mx-2 mb-1">-</span>
                    <span class="text-gray-700 text-lg font-semibold">{activeTab}</span>
                </div>
            </section>

            <section>
                <div>
                    <Tabs.List class="ml-auto">
                        <Tabs.Trigger value="Mon compte" class="text-gray-600" onclick={() => handleTabChange("Mon compte")}>
                            Mon compte
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Connexion" class="text-gray-600" onclick={() => handleTabChange("Connexion")}>
                            Connexion
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Voix & Vidéo" class="text-gray-600" onclick={() => handleTabChange("Voix & Vidéo")}>
                            Voix & Vidéo
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Langues" class="text-gray-600" onclick={() => handleTabChange("Langues")}>
                            Langues
                        </Tabs.Trigger>
                    </Tabs.List>
                </div>
            </section>
        </div>

        <div>
            {#if activeTab === "Mon compte"}
                <Account />
            {:else if activeTab === "Langues"}
                <Language />
            {:else if activeTab === "Connexion"}
                <Connection />
            {:else if activeTab === "Voix & Vidéo"}
                <p>Contenu pour Voix & Vidéo</p>
            {/if}
        </div>
    </Tabs.Root>
</section>
