<script lang="ts">
    import {Separator} from "$lib/components/ui/separator";
    import {formatDistanceToNow} from "date-fns";
    import {fr} from "date-fns/locale";
    import {onMount} from "svelte";
    import {getPolls, type Poll, votePoll, unvotePoll} from "$lib/api/workspaces/polls";
    import {page} from "$app/state";
    import {notifyByLevel, success} from "$lib/toast/toast";
    import * as Dialog from "$lib/components/ui/dialog";
    import {Button} from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Chart from "$lib/components/ui/chart/index.js";
    import { Arc, PieChart, Text } from "layerchart";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let polls: Poll[] = $state([]);
    let showUnvoteConfirmation = $state(false);
    let selectedPollOption = $state({ pollId: "", optionId: "" });

    const COLORS = [
        "hsl(200, 70%, 50%)",  // Bleu
        "hsl(150, 70%, 50%)",  // Vert
        "hsl(350, 70%, 50%)",  // Rouge
        "hsl(50, 70%, 50%)",   // Jaune
        "hsl(280, 70%, 50%)",  // Violet
        "hsl(25, 70%, 50%)",   // Orange
        "hsl(180, 70%, 50%)",  // Turquoise
        "hsl(320, 70%, 50%)",  // Rose
        "hsl(100, 70%, 50%)",  // Vert clair
        "hsl(240, 70%, 50%)"   // Bleu foncé
    ];

    const getColor = (index: number) => COLORS[index % COLORS.length];

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
            selectedPollOption = { pollId, optionId };
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

    function cancelUnvote() {
        showUnvoteConfirmation = false;
    }

    onMount(async () => {
        if (currentWorkspaceId) {
            polls = await getPolls(currentWorkspaceId);
        }
    });
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

<div class="flex flex-col w-full p-6 space-y-6 text-gray-900 dark:text-white">
    <h1 class="text-2xl font-bold text-[#61A0AF]">Sondages</h1>
    <Separator class="dark:bg-gray-700"/>

    {#if polls.length === 0}
        <p>Aucun sondage pour le moment.</p>
    {:else}
        <div class="flex flex-col space-y-4">
            {#each polls as poll}
                <div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h2 class="text-lg font-semibold">{poll.question}</h2>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(poll.expiresat), {addSuffix: true, locale: fr})}
                        </span>
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
                                    onclick={() => handleVoteAction(poll.id, option.id, option.is_voted)}>
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
                                            <Chart.Tooltip hideLabel indicator="line" />
                                        {/snippet}
                                        {#snippet arc({ props, visibleData, index })}
                                            <Arc {...props}>
                                                {#snippet children({ getArcTextProps })}
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