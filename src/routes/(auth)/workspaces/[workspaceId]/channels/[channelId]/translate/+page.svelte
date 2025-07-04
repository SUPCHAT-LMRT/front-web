<script lang="ts">
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {getSupportedLanguages, translateText} from "$lib/api/translate";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {Button} from "$lib/components/ui/button";
    import {Label} from "$lib/components/ui/label";
    import {ArrowLeft, Loader2} from 'lucide-svelte';
    import {page} from "$app/state";

    let inputText = $state('');
    let outputText = $state('');
    let sourceLang = $state('fr');
    let targetLang = $state('en');
    let languages: { code: string, name: string }[] = $state([]);
    let isLoading = $state(false);

    let currentWorkspaceId = $state(page.params.workspaceId);
    let currentChannelId = $state(page.params.channelId);

    onMount(async () => {
        try {
            languages = await getSupportedLanguages();
        } catch (error) {
            toast.error("Erreur lors du chargement des langues");
            console.error("Erreur lors du chargement des langues :", error);
        }
    });

    async function handleTranslate() {
        if (!inputText.trim()) {
            toast.error("Veuillez entrer du texte à traduire");
            return;
        }

        isLoading = true;
        try {
            outputText = await translateText(inputText, sourceLang, targetLang);
            toast.success("Traduction effectuée avec succès");
        } catch (error) {
            toast.error("Erreur lors de la traduction");
            console.error("Erreur lors de la traduction :", error)
        } finally {
            isLoading = false;
        }
    }

    const handleBack = () => {
        window.location.href = `/workspaces/${currentWorkspaceId}/channels/${currentChannelId}`;
    };
</script>

<div class="container mx-auto p-6">
    <div class="space-y-6">
        <div class="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onclick={handleBack} class="h-8 w-8">
                <ArrowLeft class="h-4 w-4"/>
            </Button>
            <h2 class="text-xl font-semibold">Traducteur</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Texte source</CardTitle>
                    <CardDescription>Entrez le texte à traduire</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="flex justify-between items-center">
                        <Label for="sourceLang">Langue source</Label>
                        <select
                                id="sourceLang"
                                bind:value={sourceLang}
                                class="w-40 rounded-md border-input bg-background text-sm ring-offset-background
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {#each languages as lang}
                                <option value={lang.code}>{lang.name}</option>
                            {/each}
                        </select>
                    </div>

                    <textarea
                            bind:value={inputText}
                            class="w-full h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm
                               ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Entrez le texte à traduire..."
                    ></textarea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Traduction</CardTitle>
                    <CardDescription>Résultat de la traduction</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="flex justify-between items-center">
                        <Label for="targetLang">Langue cible</Label>
                        <select
                                id="targetLang"
                                bind:value={targetLang}
                                class="w-40 rounded-md border-input bg-background text-sm ring-offset-background
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {#each languages as lang}
                                <option value={lang.code}>{lang.name}</option>
                            {/each}
                        </select>
                    </div>

                    <textarea
                            readonly
                            value={outputText}
                            class="w-full h-[200px] rounded-md border border-input bg-muted px-3 py-2 text-sm
                               ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Traduction..."
                    ></textarea>
                </CardContent>
            </Card>
        </div>

        <div class="flex justify-center">
            <Button
                    onclick={handleTranslate}
                    disabled={isLoading}
                    class="min-w-[200px]"
            >
                {#if isLoading}
                    <span class="inline-flex items-center">
                        <Loader2 class="animate-spin -ml-1 mr-3 h-5 w-5"/>
                        Traduction en cours...
                    </span>
                {:else}
                    Traduire
                {/if}
            </Button>
        </div>
    </div>
</div>