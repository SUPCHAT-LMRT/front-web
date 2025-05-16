<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import JobCreator from "./JobCreator.svelte";
    import {Dialog, DialogContent, DialogHeader, DialogTitle} from "$lib/components/ui/dialog";
    import {AxiosError} from "axios";
    import {writable} from "svelte/store";
    import AppMembers from "./AppMembers.svelte";
    import {jobList} from "./state.svelte";
    import {createJob, type Job} from "$lib/api/admin";
    import JobList from "./JobList.svelte";

    let selectedJob: Job | null = $state(null);
    let showModal = $state(false);
    let error = writable("");

    const handleJobCreated = async (jobData: { name: string; permissions: number }) => {
        try {
            const createdJob = await createJob(jobData.name);
            jobList.jobs = [...jobList.jobs, createdJob];
            selectedJob = createdJob;
            showModal = false;
        } catch (e) {
            console.error(e);
            error.set("Erreur lors de la création du poste.");
            if (e instanceof AxiosError) {
                if (e.response?.status === 403) {
                    error.set("Vous n'avez pas la permission de créer un poste.");
                } else if (e.response?.status === 404) {
                    error.set("Espace de travail introuvable.");
                } else {
                    error.set("Erreur inconnue lors de la création du poste.");
                }
            } else {
                error.set("Erreur inconnue lors de la création du poste.");
            }
        }
    };
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Gestion des Postes</h2>
    </div>

    <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="md:col-span-1">
                <Card class="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Postes</CardTitle>
                        <CardDescription>
                            Gérer les postes de l'application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="flex-grow">
                        <JobList bind:selectedJob={selectedJob}/>
                    </CardContent>
                    <div class="p-4 flex justify-center items-center flex-grow-0">
                        <Button class="text-white w-full" onclick={() => (showModal = true)}>Créer un poste</Button>
                    </div>
                </Card>
            </div>

            <div class="md:col-span-1">
                <Card class="h-full flex flex-col">
                    <CardContent class="flex-grow">
                        <AppMembers/>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</div>

<Dialog open={showModal} onOpenChange={(open) => (showModal = open)}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Créer un nouveau poste</DialogTitle>
        </DialogHeader>
        <JobCreator onJobCreated={handleJobCreated}/>
    </DialogContent>
</Dialog>