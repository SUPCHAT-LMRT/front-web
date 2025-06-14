<script lang="ts">
    import {Separator} from "$lib/components/ui/separator";
    import {formatDistanceToNow} from "date-fns";
    import {fr} from "date-fns/locale";
    import {onMount} from "svelte";
    import {
        getPolls,
        votePoll,
        unvotePoll,
        type Poll,
        createPoll, deletePoll
    } from "$lib/api/workspaces/polls";
    import {page} from "$app/state";
    import {notifyByLevel, success} from "$lib/toast/toast";
    import * as Dialog from "$lib/components/ui/dialog";
    import {Button} from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Chart from "$lib/components/ui/chart/index.js";
    import {Arc, PieChart, Text} from "layerchart";
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";
    import {MoreHorizontal} from "lucide-svelte";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let polls: Poll[] = $state([]);
    let showUnvoteConfirmation = $state(false);
    let selectedPollOption = $state({pollId: "", optionId: ""});

    const COLORS = [
        "hsl(200, 70%, 50%)",
        "hsl(150, 70%, 50%)",
        "hsl(350, 70%, 50%)",
        "hsl(50, 70%, 50%)",
        "hsl(280, 70%, 50%)",
        "hsl(25, 70%, 50%)",
        "hsl(180, 70%, 50%)",
        "hsl(320, 70%, 50%)",
        "hsl(100, 70%, 50%)",
        "hsl(240, 70%, 50%)"
    ];

    const getColor = (index: number) => COLORS[index % COLORS.length];

    // Formulaire de création de sondage
    let newQuestion = $state("");
    let newOptions: string[] = $state(["", ""]);
    let newExpiresAt = $state("");

    function addOption() {
        newOptions = [...newOptions, ""];
    }

    function updateOption(index: number, value: string) {
        newOptions[index] = value;
    }

    async function submitNewPoll() {
        if (!currentWorkspaceId || !newQuestion || newOptions.some(opt => !opt.trim())) {
            notifyByLevel({
                title: "Erreur",
                level: "error",
                message: "Veuillez remplir tous les champs.",
            });
            return;
        }

        try {
            const isoDate = newExpiresAt ? new Date(newExpiresAt).toISOString() : undefined;
            await createPoll(currentWorkspaceId, newQuestion, newOptions, isoDate);
            polls = await getPolls(currentWorkspaceId);
            success("Sondage créé", "Votre sondage a été créé avec succès.");
            newQuestion = "";
            newOptions = [""];
            newExpiresAt = "";
        } catch (error) {
            console.error("Erreur lors de la création du sondage :", error);
            notifyByLevel({
                title: "Erreur",
                level: "error",
                message: "Impossible de créer le sondage.",
            });
        }
    }

    async function Handle(pollId: string, optionId: string) {
        if (currentWorkspaceId) {
            try {
                await votePoll(currentWorkspaceId, pollId, optionId);
                const response = await getPolls(currentWorkspaceId);
                polls = response.map(poll => ({
                    ...poll,
                    options: poll.options.map(opt => ({
                        ...opt
                    }))
                }));
            } catch (error: never) {
                console.error("Erreur lors du vote :", error);

                if (error.response?.data?.code === "ALREADY_VOTED") {
                    notifyByLevel({
                        title: "Vote non autorisé",
                        level: "warning",
                        message: "Vous avez déjà voté pour ce sondage",
                    });
                } else {
                    notifyByLevel({
                        title: "Erreur",
                        level: "error",
                        message: "Une erreur est survenue lors du vote.",
                    });
                }
            }
        }
    }

    async function handleVoteAction(pollId: string, optionId: string, isVoted: boolean) {
        if (!currentWorkspaceId) return;

        if (isVoted) {
            selectedPollOption = {pollId, optionId};
            showUnvoteConfirmation = true;
        } else {
            await Handle(pollId, optionId);
        }
    }

    async function confirmUnvote() {
        try {
            await unvotePoll(currentWorkspaceId, selectedPollOption.pollId, selectedPollOption.optionId);
            const response = await getPolls(currentWorkspaceId);
            polls = response.map(poll => ({
                ...poll,
                options: poll.options.map(opt => ({
                    ...opt
                }))
            }));
            success("Vote annulé", "Votre vote a été annulé avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'annulation du vote :", error);
            notifyByLevel({
                title: "Erreur",
                level: "error",
                message: "Une erreur est survenue lors de l'annulation du vote.",
            });
        } finally {
            showUnvoteConfirmation = false;
        }
    }

    async function handleDeletePoll(pollId: string) {
        if (!currentWorkspaceId) return;

        try {
            await deletePoll(currentWorkspaceId, pollId);
            polls = await getPolls(currentWorkspaceId);
            success("Sondage supprimé", "Le sondage a bien été supprimé.");
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            notifyByLevel({
                title: "Erreur",
                level: "error",
                message: "Une erreur est survenue lors de la suppression.",
            });
        }
    }


    function cancelUnvote() {
        showUnvoteConfirmation = false;
    }

    onMount(async () => {
        if (currentWorkspaceId) {
            polls = await getPolls(currentWorkspaceId);
        }
    });

    let showDeleteDialog = $state(false);
    let pollToDelete: Poll | null = $state(null);

    function openDeleteDialog(poll: Poll) {
        pollToDelete = poll;
        showDeleteDialog = true;
    }

    function closeDeleteDialog() {
        pollToDelete = null;
        showDeleteDialog = false;
    }

</script>

<Dialog.Root open={showUnvoteConfirmation} onOpenChange={(open) => showUnvoteConfirmation = open}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Confirmer l'annulation du vote</Dialog.Title>
            <Dialog.Description>
                Êtes-vous sûr de vouloir annuler votre vote ? Cette action est définitive.
            </Dialog.Description>
        </Dialog.Header>
        <div class="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onclick={cancelUnvote}>Annuler</Button>
            <Button variant="destructive" onclick={confirmUnvote}>Confirmer</Button>
        </div>
    </Dialog.Content>
</Dialog.Root>

<div class="flex flex-col w-full p-6 space-y-6 text-gray-900 dark:text-white h-full overflow-y-auto">
    <h1 class="text-2xl font-bold text-[#61A0AF]">Sondages</h1>
    <Separator class="dark:bg-gray-700"/>

    <!-- Formulaire de création de sondage -->
    <div class="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md space-y-4">
        <Label for="question">Question du sondage</Label>
        <Input id="question" bind:value={newQuestion} placeholder="Ex : Quel est votre langage préféré ?"/>

        <div class="space-y-2">
            <Label>Options</Label>
            {#each newOptions as option, index}
                <div class="flex items
                    space-x-2">
                    <Input
                            type="text"
                            bind:value={newOptions[index]}
                            placeholder={`Option ${index + 1}`}
                            oninput={() => updateOption(index, newOptions[index])}
                    />
                    {#if index > 1}
                        <Button variant="destructive"
                                onclick={() => newOptions = newOptions.filter((_, i) => i !== index)}>
                            Supprimer
                        </Button>
                    {/if}
                </div>
            {/each}
            <Button variant="ghost" class="mt-2" onclick={addOption}>+ Ajouter une option</Button>
        </div>

        <Label for="expires">Expire le (facultatif)</Label>
        <Input id="expires" type="datetime-local" bind:value={newExpiresAt}/>

        <Button onclick={submitNewPoll}>Créer le sondage</Button>
    </div>

    {#if polls.length === 0}
        <p>Aucun sondage pour le moment.</p>
    {:else}
        <div class="flex flex-col space-y-4">
            {#each polls as poll}
                <div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h2 class="text-lg font-semibold">{poll.question}</h2>
                        <div class="flex items-center space-x-2">
                            <button
                                    class="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full transition"
                                    onclick={() => openDeleteDialog(poll)}
                                    aria-label="Options"
                            >
                                <MoreHorizontal class="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                        {#each poll.options as option}
                            <button
                                    class={`flex items-center justify-between px-3 py-2 rounded
                                relative overflow-hidden
                                ${option.is_voted
                                    ? 'bg-transparent'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                                transition-colors w-full`}
                                    onclick={() => handleVoteAction(poll.id, option.id, option.is_voted)}
                            >
                                <div class={`absolute inset-0 transition-transform duration-500 ease-out
                                ${option.is_voted ? 'translate-x-0' : '-translate-x-full'}
                                bg-primary`}>
                                </div>
                                <span class="relative z-10">{option.text}</span>
                                <span class={`relative z-10 text-sm font-medium ${option.is_voted
                                    ? 'text-primary-foreground'
                                    : 'text-gray-600 dark:text-gray-300'}`}>
                                    {option.votes} vote{option.votes > 1 ? "s" : ""}
                                </span>
                            </button>
                        {/each}
                    </div>

                    {#if poll.options.some(opt => opt.is_voted)}
                        <Card.Root class="flex flex-col mt-4">
                            <Card.Header class="items-center">
                                <Card.Title>Résultats du sondage</Card.Title>
                            </Card.Header>
                            <Card.Content class="flex-1">
                                <Chart.Container
                                        config={{}}
                                        class="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart
                                            data={poll.options.map((opt, index) => ({
                                            option: opt.text,
                                            votes: opt.votes,
                                            color: getColor(index)
                                        }))}
                                            key="option"
                                            value="votes"
                                            cRange={poll.options.map((_, index) => getColor(index))}
                                            c="color"
                                            innerRadius={60}
                                            props={{
                                            pie: { motion: "tween" }
                                        }}
                                    >
                                        {#snippet aboveMarks()}
                                            <Text
                                                    value={String(poll.options.reduce((acc, opt) => acc + opt.votes, 0))}
                                                    textAnchor="middle"
                                                    verticalAnchor="middle"
                                                    class="fill-foreground text-3xl! font-bold"
                                                    dy={3}
                                            />
                                            <Text
                                                    value="Votes totaux"
                                                    textAnchor="middle"
                                                    verticalAnchor="middle"
                                                    class="fill-muted-foreground! text-muted-foreground"
                                                    dy={22}
                                            />
                                        {/snippet}
                                        {#snippet tooltip()}
                                            <Chart.Tooltip hideLabel indicator="line"/>
                                        {/snippet}
                                        {#snippet arc({props, visibleData, index})}
                                            <Arc {...props}>
                                                {#snippet children({getArcTextProps})}
                                                    <Text
                                                            value={`${visibleData[index].option.slice(0, 10)}${visibleData[index].option.length > 10 ? '...' : ''} (${visibleData[index].votes})`}
                                                            {...getArcTextProps("outer", {
                                                                startOffset: "50%",
                                                                outerPadding: 20,
                                                            })}
                                                            class="fill-foreground text-sm"
                                                    />
                                                {/snippet}
                                            </Arc>
                                        {/snippet}
                                    </PieChart>
                                </Chart.Container>
                            </Card.Content>
                        </Card.Root>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<Dialog.Root open={showDeleteDialog} onOpenChange={(open) => showDeleteDialog = open}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Supprimer le sondage</Dialog.Title>
            <Dialog.Description>
                Êtes-vous sûr de vouloir supprimer ce sondage ? Cette action est irréversible.
            </Dialog.Description>
        </Dialog.Header>
        <div class="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onclick={closeDeleteDialog}>Annuler</Button>
            <Button
                    variant="destructive"
                    onclick={async () => {
                    if (pollToDelete) {
                        await handleDeletePoll(pollToDelete.id);
                        closeDeleteDialog();
                    }
                }}
            >
                Supprimer
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>
