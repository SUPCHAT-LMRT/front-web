<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { cn } from "$lib/utils.js";
    import { Github, Loader } from "lucide-svelte";
    import { registerUser } from "$lib/api/user";

    let className: string | undefined | null = undefined;
    export { className as class };

    let isLoading = false;
    let email = "";
    let password = "";
    let passwordConfirmation = "";
    let firstName = "";
    let lastName = "";
    let pseudo = "";
    let birthDate = "";

    async function onSubmit() {
        isLoading = true;
        try {
            const formattedBirthDate = new Date(birthDate).toISOString().slice(0, 10);
            const response = await registerUser(email, password, passwordConfirmation, firstName, lastName, pseudo, formattedBirthDate);
            console.log("User registered successfully:", response);
        } catch (error) {
            console.error("Error registering user:", error);
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
                <Label class="sr-only" for="password">Password</Label>
                <Input
                        id="passwordConfirmation"
                        placeholder="Password Confirmation"
                        type="password"
                        bind:value={passwordConfirmation}
                        disabled={isLoading}
                />
                <Label class="sr-only" for="firstName">First Name</Label>
                <Input
                        id="firstName"
                        placeholder="First Name"
                        type="text"
                        bind:value={firstName}
                        disabled={isLoading}
                />
                <Label class="sr-only" for="lastName">Last Name</Label>
                <Input
                        id="lastName"
                        placeholder="Last Name"
                        type="text"
                        bind:value={lastName}
                        disabled={isLoading}
                />
                <Label class="sr-only" for="pseudo">Pseudo</Label>
                <Input
                        id="pseudo"
                        placeholder="Pseudo"
                        type="text"
                        bind:value={pseudo}
                        disabled={isLoading}
                />
                <Label class="sr-only" for="birthDate">Birth Date</Label>
                <Input
                        id="birthDate"
                        placeholder="YYYY-MM-DD"
                        type="date"
                        bind:value={birthDate}
                        disabled={isLoading}
                />
            </div>
            <Button type="submit" disabled={isLoading}>
                {#if isLoading}
                    <Loader class="mr-2 h-4 w-4 animate-spin" />
                {/if}
                Register
            </Button>
        </div>
    </form>
</div>l