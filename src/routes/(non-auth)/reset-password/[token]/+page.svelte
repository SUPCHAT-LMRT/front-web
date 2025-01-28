<script lang="ts">
    import {Button} from "$lib/components/ui/button/index.js";
    import {cn} from "$lib/utils";
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";
    import {forgotPassword, resetPassword} from "$lib/api/user";
    import {page} from "$app/state";

    let className = "";
    let newPassword = "";
    let confirmPassword = "";

    const { token } = page.params;

    async function onForgotPassword() {
        if (newPassword !== confirmPassword) {
            console.error("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const response = await resetPassword(token, newPassword, confirmPassword);
            console.log("Mot de passe réinitialisé avec succès:", response);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        }
    }
</script>

<div class="container flex min-h-screen items-center justify-center">
    <div class="pl-32">
        <div class="mx-auto flex w-full flex-col justifier-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Se connecter</h1>
            </div>
            <div class={cn("grid gap-6", className)}>
                <Button
                        href="/register"
                        variant="ghost"
                        class="absolute right-2 top-2"
                >
                    retour à la connexion
                </Button>
                <form onsubmit={onForgotPassword}>
                    <div class="grid gap-2">
                        <div class="grid gap-1">
                            <Label class="sr-only" for="email">Nouveau mot de passe</Label>
                            <Input
                                    id="password"
                                    placeholder="Confirmer le mot de passe"
                                    type="password"
                                    bind:value={newPassword}
                            />
                            <Label class="sr-only" for="password">Confirmer le mot de passe</Label>
                            <Input
                                    id="confirmPassword"
                                    placeholder="Confirmer le mot de passe"
                                    type="password"
                                    bind:value={confirmPassword}
                            />
                        </div>
                        <Button class="bg-[#61A0AF]" type="submit">
                            Se connecter
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>