<script lang="ts">
    import {onMount} from "svelte";
    import {Button, buttonVariants} from "$lib/components/ui/button";
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";
    import {Loader} from "lucide-svelte";
    import {Calendar1} from "lucide-svelte";
    import {
        DateFormatter,
        type DateValue,
        getLocalTimeZone
    } from "@internationalized/date";
    import {cn} from "$lib/utils.js";
    import * as Popover from "$lib/components/ui/popover";
    import {registerUser, getInviteLinkData} from "$lib/api/user";
    import CalendarNew from "./CalendarNew.svelte";
    import {goto} from "$lib/utils/goto";
    import {success, notifyByLevel} from "$lib/toast/toast";
    import {page} from "$app/state";

    const df = new DateFormatter("en-US", {
        dateStyle: "long"
    });

    let value = $state<DateValue | undefined>();
    let contentRef = $state<HTMLElement | null>(null);

    let className: string | undefined | null = $state("undefined");
    export {className as class};

    let isLoading = $state(false);
    let email = $state("");
    let password = $state("");
    let passwordConfirmation = $state("");
    let firstName = $state("");
    let lastName = $state("");
    let pseudo = $state("");

    const {token} = page.params;

    onMount(async () => {
        try {
            const inviteData = await getInviteLinkData(token);
            email = inviteData.email;
            firstName = inviteData.firstName;
            lastName = inviteData.lastName;
        } catch (error) {
            console.error("Error fetching invite link data:", error);
        }
    });

    async function onSubmit() {
        isLoading = true;
        try {
            const response = await registerUser(
                token,
                password,
                passwordConfirmation,
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
            notifyByLevel({title, level, message});
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
                        disabled={true}
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
                            disabled={true}
                    />
                    <Label class="sr-only" for="lastName">Last Name</Label>
                    <Input
                            id="lastName"
                            placeholder="Last Name"
                            type="text"
                            bind:value={lastName}
                            disabled={true}
                    />
                </div>
            </div>
            <Button class="bg-[#61A0AF] dark:text-white" type="submit" disabled={isLoading}>
                {#if isLoading}
                    <Loader class="mr-2 h-4 w-4 animate-spin"/>
                {/if}
                Register
            </Button>
        </div>
    </form>
</div>