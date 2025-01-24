<script>
import {Button} from "$lib/components/ui/button";
import { Lock } from "lucide-svelte";

import * as Tabs from "$lib/components/ui/tabs";
import CardPdp from "$lib/components/app/settings/CardPdp.svelte";

let changeTab = "Mon compte";

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
                            Mon compte
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Connexion" class="text-gray-600">
                            Connexion
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Voix & Vidéo" class="text-gray-600">
                            Voix & Vidéo
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Langues" class="text-gray-600">
                            Langues
                        </Tabs.Trigger>
                    </Tabs.List>
                </div>
            </section>
        </div>

        <CardPdp />

        <section class="px-4 py-2 ml-2 pt-8">
            <h1 class="text-gray-700 text-lg font-semibold">Mot de passe et authentification</h1>
            <div class="flex items-center mt-7">
                <Lock class="text-green-500" />
                <h2 class="text-green-500 text-xs font-bold uppercase ml-1">
                    Authentification multi-facteur activée
                </h2>
            </div>
            <Button class="bg-blue-500 hover:bg-blue-600 text-white h-8 mt-3">Changer le mot de passe</Button>
            <h2 class="text-gray-700 text-xs font-bold mt-7 uppercase">Authentification de secours par sms</h2>
            <p class="text-gray-700 text-sm mt-3">Ajoute ton téléphone comme méthode de MFA de secours au cas où tu perderais l'accès à ton application <br> d'authentification ou à tes codes de sauvegarde.</p>
            <div class="flex items-center gap-2">
                <p class="text-gray-700 text-sm">Ton numéro de téléphone actuel est le ******5116</p>
                <Button variant="link" class="text-blue-500 p-0 h-auto">
                    Afficher
                </Button>
            </div>
            <Button class="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors h-8 mt-3">
                Changer le mot de passe
            </Button>

            <h2 class="text-gray-700 text-xs font-bold mt-7 uppercase">Suppression du compte</h2>
            <p class="text-gray-700 text-sm mt-3">Supprimer ton compte signifie que tu ne pourras plus le récupérer.</p>
            <Button class="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors h-8 mt-3 mb-10">
                Supprimer le compte
            </Button>
        </section>

    </Tabs.Root>
</section>