<script lang="ts">
    import {page} from "$app/state";
    import {Button} from "$lib/components/ui/button";
    import {error, success} from "$lib/toast/toast";
    import {Moon, Sun} from "lucide-svelte";
    import {toggleMode} from "mode-watcher";
    import {tick} from "svelte";
    import UserAuthForm from "./(components)/user-auth-form.svelte";
    import {goto} from "$app/navigation";
    import { Dialog, DialogContent, DialogTitle } from '$lib/components/ui/dialog';

    let showInviteDialog = $state(false);
    let token = $state('');

    function openInviteDialog() {
        token = '';
        showInviteDialog = true;
    }

    $effect(() => {
        const notifyError = async () => {
            await tick();
            if (page.url.searchParams.get("error")) {
                const errorMsg = page.url.searchParams.get("error");
                if (errorMsg) {
                    error("Une erreur est survenue lors de la connexion.", errorMsg);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("error");
                    window.history.replaceState({}, document.title, url.toString());
                }
            }
        };

        const notifySuccess = async () => {
            await tick();
            if (page.url.searchParams.get("success")) {
                const successMsg = page.url.searchParams.get("success");
                if (successMsg) {
                    success("Compte créé avec succès", successMsg);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("success");
                    window.history.replaceState({}, document.title, url.toString());
                }
            }
        };

        notifyError();
        notifySuccess();
    });

    function confirmInvite() {
        goto(`/register/${token}`);
        showInviteDialog = false;
    }
</script>

<div class="container flex flex-col min-h-screen items-center justify-center z-10">
    <div class="pl-32">
        <div class="mx-auto flex w-full flex-col justifier-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Se connecter</h1>
            </div>
            <UserAuthForm/>
            <p class="text-muted-foreground px-8 text-center text-sm">
                En cliquant sur continuer, vous acceptez nos
                <a href="/cgus" class="hover:text-primary underline underline-offset-4">
                    Conditions d'utilisation
                </a>.
            </p>
            <Button variant="outline" onclick={openInviteDialog}>
                Je suis invité
            </Button>
        </div>
    </div>

    <Button onclick={toggleMode} variant="outline" size="icon" class="absolute bottom-4 right-4">
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
        <span class="sr-only">Toggle theme</span>
    </Button>
</div>

<Dialog bind:open={showInviteDialog}>
    <DialogContent class="sm:max-w-[425px]">
        <DialogTitle>Invitation</DialogTitle>
        <p>Vous avez été invité à rejoindre l'application. Voulez-vous continuer ?</p>
        <input
                type="text"
                class="border p-2 w-full mb-4 rounded"
                bind:value={token}
                placeholder="Token"
        />
        <div class="flex justify-end space-x-2 mt-4">
            <Button class="outline" onclick={() => (showInviteDialog = false)}>Annuler</Button>
            <Button class="primary" onclick={confirmInvite}>Continuer</Button>
        </div>
    </DialogContent>
</Dialog>
