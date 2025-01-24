<script>
import {Button} from "$lib/components/ui/button";
import {Hash, Lock, Settings, Shield} from "lucide-svelte";
import {Card} from "$lib/components/ui/card";
import {Badge} from "$lib/components/ui/badge";
import * as Tabs from "$lib/components/ui/tabs";

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

        <section class="px-4 py-2 pt-8 ml-2">
            <div class="mx-auto w-[600px]">
                <div class="relative">
                    <div class="h-28 bg-blue-100 rounded-t-lg"></div>

                    <div class="absolute bottom-0 left-6 transform translate-y-1/2 flex items-end">
                        <div class="relative">
                            <img src="https://github.com/shadcn.png" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-gray-200">
                            <div class="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-200"></div>
                        </div>
                    </div>

                    <div class="absolute bottom-4 right-4">
                        <Button class="bg-blue-500 hover:bg-blue-600 text-white h-8">Modifier profil d&apos;utilisateur</Button>
                    </div>
                </div>

                <Card class="mt-16 bg-white border border-gray-200 text-gray-800 p-6 shadow-sm max-w-3xl mx-auto">
                    <div class="flex gap-2 mb-6 ml-2">
                        <Badge variant="secondary" class="bg-purple-200 text-purple-700 hover:bg-purple-300">
                            <Shield class="w-4 h-4 mx-1" />
                        </Badge>
                        <Badge variant="secondary" class="bg-emerald-200 text-emerald-700 hover:bg-emerald-300">
                            <Hash class="w-4 h-4 mx-1" />
                        </Badge>
                        <Badge variant="secondary" class="bg-emerald-200 text-emerald-700 hover:bg-emerald-300">
                            <Settings class="w-4 h-4 mx-1" />
                        </Badge>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-medium text-gray-500">NOM D&apos;AFFICHAGE</div>
                                <div>lulu</div>
                            </div>
                            <Button variant="secondary" class="bg-gray-200 hover:bg-gray-300 text-gray-700" size="sm">
                                Modifier
                            </Button>
                        </div>

                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-medium text-gray-500">NOM D&apos;UTILISATEUR</div>
                                <div>lulu38m</div>
                            </div>
                            <Button variant="secondary" class="bg-gray-200 hover:bg-gray-300 text-gray-700" size="sm">
                                Modifier
                            </Button>
                        </div>

                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-medium text-gray-500">E-MAIL</div>
                                <div class="flex items-center gap-2">
                                    <span>************@gmail.com</span>
                                    <Button variant="link" class="text-blue-500 p-0 h-auto">
                                        Afficher
                                    </Button>
                                </div>
                            </div>
                            <Button variant="secondary" class="bg-gray-200 hover:bg-gray-300 text-gray-700" size="sm">
                                Modifier
                            </Button>
                        </div>

                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-medium text-gray-500">NUMÉRO DE TÉLÉPHONE</div>
                                <div class="flex items-center gap-2">
                                    <span>********5116</span>
                                    <Button variant="link" class="text-blue-500 p-0 h-auto">
                                        Afficher
                                    </Button>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <Button variant="ghost" class="text-gray-500 hover:text-gray-700 hover:bg-gray-200" size="sm">
                                    Supprimer
                                </Button>
                                <Button variant="secondary" class="bg-gray-200 hover:bg-gray-300 text-gray-700" size="sm">
                                    Modifier
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </section>

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