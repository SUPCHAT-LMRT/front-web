<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Loader } from "lucide-svelte";
    import { Calendar1 } from "lucide-svelte";
    import {
        DateFormatter,
        type DateValue,
        getLocalTimeZone
    } from "@internationalized/date";
    import { cn } from "$lib/utils.js";
    import * as Popover from "$lib/components/ui/popover";
    import { registerUser } from "$lib/api/user";
    import CalendarNew from "./CalendarNew.svelte";
    import { goto } from "$lib/utils/goto";
    import { success, notifyByLevel } from "$lib/toast/toast";

    const df = new DateFormatter("en-US", {
        dateStyle: "long"
    });

    let value = $state<DateValue | undefined>();
    let contentRef = $state<HTMLElement | null>(null);

    let className: string | undefined | null = $state("undefined");
    export { className as class };

    let isLoading = $state(false);
    let email = $state("");
    let password = $state("");
    let passwordConfirmation = $state("");
    let firstName = $state("");
    let lastName = $state("");
    let pseudo = $state("");

    function formatToISODate(value: DateValue, timeZone: string): string {
        const date = value.toDate(timeZone);
        const normalizedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return normalizedDate.toISOString().slice(0, 10);
    }

    async function onSubmit() {
        isLoading = true;
        try {
            const formattedBirthDate = value ? formatToISODate(value, getLocalTimeZone()) : "";
            const response = await registerUser(
                email,
                password,
                passwordConfirmation,
                firstName,
                lastName,
                pseudo,
                formattedBirthDate
            );
            console.log("User registered successfully:", response);
            goto("/login");
            success("Inscription réussie !", "Votre compte a bien été créé.");
        } catch (error) {
            console.error("Error registering user:", error);
            const errorData = error.response?.data || {};
            const title = "Erreur lors de l'inscription";
            const level: 'warning' | 'error' = errorData.level || 'error';
            const message = errorData.messageDisplay || "Une erreur est survenue";
            notifyByLevel({ title, level, message });
        } finally {
            isLoading = false;
        }
    }
</script>


<div class={cn("grid gap-6", className)}>
    <Button
            href="/login"
            variant="ghost"
            class="absolute right-2 top-2"
    >
        Se connecter
    </Button>
    <form onsubmit={onSubmit}>
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
                <div class="flex gap-1">
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
                </div>
                <Label class="sr-only" for="pseudo">Pseudo</Label>
                <Input
                        id="pseudo"
                        placeholder="Pseudo"
                        type="text"
                        bind:value={pseudo}
                        disabled={isLoading}
                />
                <Label class="sr-only" for="birthDate">Birth Date</Label>
                <Popover.Root>
                    <Popover.Trigger
                            class={cn(
                                          buttonVariants({
                                            variant: "outline",
                                            class: "w-[380px] justify-start text-left font-normal"
                                          }),
                                          !value && "text-muted-foreground"
                                        )}
                    >
                        <Calendar1/>
                        {value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
                    </Popover.Trigger>
                    <Popover.Content bind:ref={contentRef} class="w-auto p-0">
                        <CalendarNew bind:value id="birthDate" disabled={isLoading} type="single"/>
                    </Popover.Content>
                </Popover.Root>
            </div>
            <Button class="bg-[#61A0AF]" type="submit" disabled={isLoading}>
                {#if isLoading}
                    <Loader class="mr-2 h-4 w-4 animate-spin"/>
                {/if}
                Register
            </Button>
        </div>
    </form>
</div>