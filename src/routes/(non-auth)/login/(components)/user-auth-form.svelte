<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { cn } from "$lib/utils.js";
    import { Github, Loader } from "lucide-svelte";
    import { loginUser } from "$lib/api/user";

    let className: string | undefined | null = undefined;
    export { className as class };

    let isLoading = false;
    let email = "";
    let password = "";
    let rememberMe = false;

    async function onSubmit() {
        isLoading = true;
        try {
            console.log(email, password, rememberMe);
            const response = await loginUser(
                email,
                password,
                rememberMe,
            );
            console.log("User logged in successfully:", response);
        } catch (error) {
            console.error("Error logging in user:", error);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class={cn("grid gap-6", className)} {...$$restProps}>
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
                        disabled={isLoading}
                />
                <Label class="sr-only" for="password">Password</Label>
                <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        bind:value={password}
                        disabled={isLoading}
                />
            </div>
            <div class="flex items-center space-x-2">
                <input
                        id="remember-me"
                        type="checkbox"
                        bind:checked={rememberMe}
                        class="rounded border-muted focus:ring-primary"
                        disabled={isLoading}
                />
                <Label for="remember-me">Rester connecté</Label>
            </div>
            <Button type="submit" disabled={isLoading}>
                {#if isLoading}
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
    <Button variant="outline" type="button" disabled={isLoading}>
        {#if isLoading}
            <Loader class="mr-2 h-4 w-4 animate-spin" />
        {:else}
            <Github class="mr-2" />
        {/if}
        Github
    </Button>
</div>