<script lang="ts">
    import UserAuthForm from "./(components)/user-auth-form.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
</script>

<div
        class="container relative hidden h-[800px] flex-col items-center justifier-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
    <Button
            href="/login"
            variant="ghost"
            class="absolute right-4 top-4 md:right-8 md:top-8"
    >
        Se connecter
    </Button>
    <div class="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div class="relative z-20 flex items-center text-lg font-medium">
            <!-- <Command class="mr-2 h-6 w-6" /> -->
            Acme Inc
        </div>
        <div class="relative z-20 mt-auto">
            <blockquote class="space-y-2">
                <p class="text-lg">
                    &ldquo;Cette bibliothèque m'a fait gagner d'innombrables heures de travail et m'a aidé à livrer des designs époustouflants à mes clients plus rapidement que jamais. Hautement recommandé !&rdquo;
                </p>
                <footer class="text-sm">Sofia Davis</footer>
            </blockquote>
        </div>
    </div>
    <div class="lg:p-8">
        <div class="mx-auto flex w-full flex-col justifier-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Créer un compte</h1>
                <p class="text-muted-foreground text-sm">
                    Entrez votre email ci-dessous pour créer votre compte
                </p>
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