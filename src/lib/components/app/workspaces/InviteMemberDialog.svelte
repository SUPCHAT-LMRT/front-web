<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { writable } from "svelte/store";
    import { ClipboardCopy } from "lucide-svelte";

    let inviteMemberData = writable({
        dialogOpen: false,
        email: ""
    });

    let inviteLink = "https://example.com/invite/12345"; // Lien d'invitation en dur

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            alert("Lien copié dans le presse-papier !");
        }).catch(err => console.error("Erreur lors de la copie :", err));
    };
</script>

<Dialog.Root bind:open={$inviteMemberData.dialogOpen}>
    <Dialog.Trigger class="mx-auto">
        Inviter un membre
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header class="flex flex-col items-center justify-center text-center relative h-full">
            <div class="text-center">
                <Dialog.Title class="text-2xl font-bold">
                    Inviter un membre
                </Dialog.Title>
                <p class="text-sm mt-2 text-gray-700">
                    Ajoute un membre à ton espace de travail en lui envoyant une invitation.
                </p>
            </div>
        </Dialog.Header>

        <div class="w-full">
            <Input bind:value={$inviteMemberData.email} type="email"
                   placeholder="Adresse e-mail"
                   class="w-full p-2 border rounded-md mb-4"/>
        </div>

        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between p-2 border rounded-md bg-gray-100">
                <span class="text-sm truncate">{inviteLink}</span>
                <Button onclick={copyInviteLink} class="p-2 bg-[#61A0AF] text-white flex items-center gap-2 rounded-md hover:hover:bg-[#4B7986]">
                    <ClipboardCopy size={16} />
                </Button>
            </div>
            <Button class="justify-center w-full h-10 px-6 bg-primary text-white">
                Envoyer l'invitation par e-mail
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>
