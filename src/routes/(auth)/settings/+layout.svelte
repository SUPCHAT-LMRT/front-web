<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs";
    import {goto} from "$lib/utils/goto";
    import ProfileCard from "$lib/components/app/settings/ProfileCard.svelte";

    let activeTab = $state("Mon compte");

    function handleTabChange(displayName: string, url: string) {
        goto(url);
        activeTab = displayName;
    }

    let { children } = $props();
</script>

<section class="ml-15 border-l-2 border-gray-200 ">
        <div class="flex flex-col px-4 py-2">
            <section>
                <div class="flex items-end mb-4">
                    <h1 class="text-3xl font-bold text-gray-700">Paramètres</h1>
                    <span class="mx-2 mb-1">-</span>
                    <span class="text-gray-700 text-lg font-semibold">{activeTab}</span>
                </div>
            </section>

            <section>
                <div>
                    <Tabs.Root>
                        <Tabs.List class="ml-auto">
                            <Tabs.Trigger value="Mon compte" class="text-gray-600" onclick={() => handleTabChange("Mon compte", "/settings/account")}>
                                Mon compte
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Connexion" class="text-gray-600" onclick={() => handleTabChange("Connexion", "/settings/connection")}>
                                Connexion
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Voix & Vidéo" class="text-gray-600" onclick={() => handleTabChange("Voix & Vidéo","/settings/voice")}>
                                Voix & Vidéo
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Langues" class="text-gray-600" onclick={() => handleTabChange("Langues", "/settings/language")}>
                                Langues
                            </Tabs.Trigger>
                        </Tabs.List>
                    </Tabs.Root>
                </div>
            </section>
            <div class="flex">
                <div class="min-w-1/2">
                {@render children?.()}
                </div>
                <ProfileCard />
            </div>

        </div>

</section>