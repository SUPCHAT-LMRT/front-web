<script lang="ts">
import * as Tabs from "$lib/components/ui/tabs";
import Language from "$lib/components/app/settings/Language.svelte";

let changeTab = "";

</script>

<section class="pl-40">
    <Tabs.Root>
        <div class="flex flex-col px-4 py-2">
            <section>
                <div class="flex items-end mb-4">
                    <h1 class="text-3xl font-bold text-gray-700">Paramètre</h1>
                    <span class="mx-2 mb-1">-</span>
                    <span class="text-gray-700 text-lg font-semibold">{changeTab}</span>
                </div>
            </section>

            <section>
                <div>
                    <Tabs.List class="ml-auto">
                        <Tabs.Trigger value="Mon compte" class="text-gray-600">
                            <span on:click={() => changeTab = "Mon compte"} class="cursor-pointer">
                                Mon compte
                            </span>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Connexion" class="text-gray-600">
                            <span on:click={() => changeTab = "Connexion"} class="cursor-pointer">
                                Connexion
                            </span>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Voix & Vidéo" class="text-gray-600">
                            <span on:click={() => changeTab = "Voix & Vidéo"} class="cursor-pointer">
                                Voix & Vidéo
                            </span>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Langues" class="text-gray-600">
                            <span on:click={() => changeTab = "Langues"} class="cursor-pointer">
                                Langues
                            </span>
                        </Tabs.Trigger>
                    </Tabs.List>
                </div>
            </section>
        </div>

        <Language/>


    </Tabs.Root>
</section>