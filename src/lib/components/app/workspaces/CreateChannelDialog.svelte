<script lang="ts">
  import { page } from "$app/state";
  import {
    getWorkspaceMembers,
    type WorkspaceMember,
  } from "$lib/api/workspaces/member";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { onMount } from "svelte";

  type Props = {
    workspaceId: string;
    createChannelData: {
      dialogOpen: boolean;
      name: string;
      topic: string;
      isPrivate?: boolean;
      members?: string[];
    };
    createChannel: () => void;
  };

  const { createChannelData, createChannel }: Props = $props();
  createChannelData.members = createChannelData.members || [];

  let step = $state(1);

  let members: WorkspaceMember[] = $state([]);
  let workspaceId = $derived(page.params.workspaceId);

  $effect(() => {
    if (!createChannelData.members) {
      createChannelData.members = [];
    }
  });

  onMount(async () => {
    try {
      const result = await getWorkspaceMembers(workspaceId, 1, 100);
      members = result.members;
    } catch (e) {
      console.error("Erreur lors du chargement des membres du workspace", e);
    }
  });

  function toggleMember(userId: string) {
    if (!createChannelData.members) createChannelData.members = [];

    if (createChannelData.members.includes(userId)) {
      createChannelData.members = [
        ...createChannelData.members.filter((id) => id !== userId),
      ];
    } else {
      createChannelData.members = [...createChannelData.members, userId];
    }
    console.log("Members après toggle:", createChannelData.members);
  }

  function handleNext() {
    if (createChannelData.isPrivate) {
      step = 2;
    } else {
      createChannel();
      closeDialog();
    }
  }

  function handleFinalCreate() {
    createChannel();
    closeDialog();
  }

  function closeDialog() {
    createChannelData.dialogOpen = false;
    step = 1;
    createChannelData.name = "";
    createChannelData.topic = "";
    createChannelData.isPrivate = false;
    createChannelData.members = [];
  }
</script>

<Dialog.Root bind:open={createChannelData.dialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header
      class="flex flex-col items-center justify-center text-center relative h-full"
    >
      <div class="text-center">
        <Dialog.Title class="text-2xl font-bold">Crée ton canal</Dialog.Title>
        <p class="text-sm mt-2 text-gray-700 dark:text-gray-300">
          Ton canal est le lieu où tu peux discuter avec tes collègues.
        </p>
      </div>
    </Dialog.Header>

    {#if step === 1}
      <div class="w-full space-y-4">
        <Input
          bind:value={createChannelData.name}
          type="text"
          placeholder="Nom du canal"
          class="w-full p-2 border rounded-md"
        />
        <Textarea
          bind:value={createChannelData.topic}
          placeholder="Topic du canal"
          class="w-full p-2 border rounded-md"
        />

        <div class="flex items-center space-x-2">
          <Checkbox bind:checked={createChannelData.isPrivate} />
          <span class="text-sm text-gray-700 dark:text-gray-300">Privé</span>
        </div>

        <Button
          onclick={handleNext}
          class="justify-center w-full h-10 px-6 bg-primary text-white"
        >
          Suivant
        </Button>
      </div>
    {:else if step === 2}
      <div class="space-y-4 max-h-[300px] overflow-y-auto">
        <p class="text-gray-700 dark:text-gray-300 text-sm">
          Sélectionne les membres du salon privé :
        </p>
        {#each members as member}
          <div class="flex items-center space-x-2">
            <Checkbox
              checked={createChannelData.members?.includes(member.id)}
              onCheckedChange={() => toggleMember(member.id)}
            />
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >{member.pseudo}</span
            >
          </div>
        {/each}

        <div class="flex gap-2 mt-4">
          <Button
            onclick={() => (step = 1)}
            class="w-full bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
          >
            Retour
          </Button>
          <Button
            onclick={handleFinalCreate}
            class="w-full bg-primary text-white"
          >
            Créer
          </Button>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
