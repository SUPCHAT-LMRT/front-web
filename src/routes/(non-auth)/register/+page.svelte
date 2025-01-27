<script lang="ts">
    import UserAuthForm from "./(components)/user-auth-form.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
</script>

<div
        class="container relative pt-20"
>
    <div class="pl-32">
        <div class="mx-auto flex w-full flex-col justifier-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Créer un compte</h1>
            </div>
            <UserAuthForm />
            <p class="text-muted-foreground px-8 text-center text-sm">
                En cliquant sur continuer, vous acceptez nos
                <a href="/terms" class="hover:text-primary underline underline-offset-4">
                    Conditions d'utilisation
                </a>
                et
                <a href="/privacy" class="hover:text-primary underline underline-offset-4">
                    Politique de confidentialité
                </a>
                .
            </p>
        </div>
    </div>
</div>