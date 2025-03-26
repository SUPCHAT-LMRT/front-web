<script lang="ts">
    import UserAuthForm from "./(components)/user-auth-form.svelte";
    import {toggleMode} from "mode-watcher";
    import {Button} from "$lib/components/ui/button";
    import {Moon, Sun} from "lucide-svelte";
</script>

<div class="container flex flex-col min-h-screen items-center justify-center bg-white z-10 dark:bg-gray-900">
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

    <Button onclick={toggleMode} variant="outline" size="icon" class="absolute bottom-4 right-4">
        <Sun
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
    </Button>
</div>