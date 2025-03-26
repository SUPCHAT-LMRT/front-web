<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";

    type Props = {
        createChannelData: {
            dialogOpen: boolean;
            name: string;
            topic: string;
        };
        createChannel: () => void;
    }

    const {createChannelData, createChannel}: Props = $props();
</script>

<Dialog.Root bind:open={createChannelData.dialogOpen}>
    <Dialog.Trigger class="mx-auto">
        Créer un canal
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header class="flex flex-col items-center justify-center text-center relative h-full">
            <div class="text-center">
                <Dialog.Title class="text-2xl font-bold">
                    Crée ton canal
                </Dialog.Title>
                <p class="text-sm mt-2 text-gray-700">
                    Ton canal est le lieu où tu peux discuter avec tes collègues.
                </p>
            </div>
        </Dialog.Header>

        <div class="w-full">
            <Input bind:value={createChannelData.name} type="text"
                   placeholder="Nom du canal"
                   class="w-full p-2 border rounded-md mb-4"/>
            <Textarea bind:value={createChannelData.topic}
                      placeholder="Topic du canal"
                      class="w-full p-2 border rounded-md mb-4"/>
        </div>

        <div class="float-end">
            <Button onclick={createChannel}
                    class="justify-center w-full h-10 px-6 bg-primary text-white">
                Créer un canal
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>