<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {validateAccount} from "$lib/api/user";
    import {page} from "$app/state";
    import {error, success} from "$lib/toast/toast";
    import {goto} from "$lib/utils/goto";

    const { token } = page.params;

    async function handleValidation() {
        try {
            await validateAccount(token);
            success("Compte validé", "Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.");
            goto("/login");
        } catch(e) {
            error("Erreur", "Erreur lors de la validation de votre compte.");
        }
    }
</script>

<div class="container flex min-h-screen items-center justify-center">
    <div class="pl-32">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Valider votre compte</h1>
            </div>
            <div class="flex justify-center">
                <Button onclick={handleValidation}>Valider mon compte</Button>
            </div>
        </div>
    </div>
</div>