<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import {Button} from "$lib/components/ui/button";
    import {writable} from "svelte/store";
    import {ClipboardCopy} from "lucide-svelte";
    import {createWorkspaceInviteLink} from "$lib/api/workspaces/workspace";
    import {success} from "$lib/toast/toast";
    import {AxiosError} from "axios";

    const {workspaceId} = $props();

    let inviteMemberData = writable({
        dialogOpen: false,
        email: ""
    });

    let inviteLink = writable("");
    let loading = writable(false);
    let error = writable("");

    const fetchInviteLink = async () => {
        loading.set(true);
        error.set("");
        inviteLink.set("");

        try {
            const link = await createWorkspaceInviteLink(workspaceId);
            inviteLink.set(link);
        } catch (e) {
            console.error(e);
            error.set("Erreur lors de la création du lien d'invitation.");
            if (e instanceof AxiosError) {
                if (e.response?.status === 403) {
                    error.set("Vous n'avez pas la permission de créer un lien d'invitation.");
                } else if (e.response?.status === 404) {
                    error.set("Espace de travail introuvable.");
                } else {
                    error.set("Erreur inconnue lors de la création du lien d'invitation.");
                }
            } else {
                error.set("Erreur inconnue lors de la création du lien d'invitation.");
            }
        } finally {
            loading.set(false);
        }
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText($inviteLink).then(() => {
            success("Lien copié", "Le lien d'invitation a été copié dans le presse-papiers.");
        }).catch(err => console.error("Erreur lors de la copie :", err));
    };

    function shortenLink(link: string): string {
        const maxLength = 40;
        return link.length > maxLength
            ? link.slice(0, 40) + "..." + link.slice(-5)
            : link;
    }
</script>

<Dialog.Root bind:open={$inviteMemberData.dialogOpen} onOpenChange={fetchInviteLink}>
    <Dialog.Trigger class="mx-auto">
        Inviter un membre
    </Dialog.Trigger>
    <Dialog.Content class="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        <Dialog.Header class="flex flex-col items-center justify-center text-center">
            <Dialog.Title class="text-2xl font-bold">Inviter un membre</Dialog.Title>
            <p class="text-sm text-center mt-2 text-gray-700 dark:text-gray-300">
                Ajoute un membre à ton espace de travail en lui envoyant une invitation.
            </p>
        </Dialog.Header>

        {#if $loading}
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">Chargement du lien...</p>
        {:else if $error}
            <p class="text-sm text-red-500 mt-4">{$error}</p>
        {:else}
            <div class="mt-2 flex flex-col gap-3">
                <div class="flex items-center justify-between gap-2 p-3 border rounded-md bg-gray-100 dark:bg-gray-700">
                    <span class="text-sm truncate dark:text-gray-300">{shortenLink($inviteLink)}</span>
                    <div class="flex items-center gap-2">
                        <Button onclick={copyInviteLink}
                                class="p-2 bg-[#61A0AF] text-white rounded-md hover:bg-[#4B7986]"
                                aria-label="Copier le lien">
                            <ClipboardCopy size={16}/>
                        </Button>
                    </div>
                </div>
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>