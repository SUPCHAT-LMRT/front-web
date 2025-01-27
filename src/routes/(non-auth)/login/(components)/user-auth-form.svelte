<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { cn } from "$lib/utils.js";
    import { Github, Loader } from "lucide-svelte";
    import { loginUser } from "$lib/api/user";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Label } from "$lib/components/ui/label/index.js";

    let className: string | undefined | null = undefined;
    export { className as class };

    let isSubmitting = false;
    let email = "";
    let password = "";
    let rememberMe = false;

    async function onSubmit() {
        isSubmitting = true;
        try {
            console.log(email, password, rememberMe);
            const response = await loginUser(email, password, rememberMe);
            console.log("User logged in successfully:", response);
        } catch (error) {
            console.error("Error logging in user:", error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class={cn("grid gap-6", className)}>
    <form on:submit|preventDefault={onSubmit}>
        <div class="grid gap-2">
            <div class="grid gap-1">
                <Label class="sr-only" for="email">Email</Label>
                <Input
                        id="email"
                        placeholder="nom@example.com"
                        type="email"
                        autocapitalize="none"
                        autocomplete="email"
                        autocorrect="off"
                        bind:value={email}
                        disabled={isSubmitting}
                />
                <Label class="sr-only" for="password">Password</Label>
                <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        bind:value={password}
                        disabled={isSubmitting}
                />
            </div>
            <div class="flex items-center space-x-2">
                <Checkbox id="terms" bind:checked={rememberMe} aria-labelledby="terms-label" />
                <Label
                        id="terms-label"
                        for="terms"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Se souvenir de moi
                </Label>
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {#if isSubmitting}
                    <Loader class="mr-2 h-4 w-4 animate-spin" />
                {/if}
                Se connecter avec l'email
            </Button>
        </div>
    </form>
    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background text-muted-foreground px-2"> Ou continuer avec </span>
        </div>
    </div>
    <Button variant="outline" type="button" disabled={isSubmitting}>
        {#if isSubmitting}
            <Loader class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        <Github class="mr-2" />
        Github
    </Button>
</div>
