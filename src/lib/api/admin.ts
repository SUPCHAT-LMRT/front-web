import {baseClient} from "$lib/api/client";

export type Job = {
    id: string;
    name: string;
    permissions: number;
    isAssigned: boolean;
}


export class JobPermission {
    public static CREATE_INVITATION = new JobPermission(1 << 0, "Créer une invitation", "Créer une invitation pour le serveur.");
    public static DELETE_INVITATION = new JobPermission(1 << 1, "Supprimer une invitation", "Supprimer une invitation pour le serveur.");
    public static ASSIGN_JOB = new JobPermission(1 << 2, "Assigner un job", "Assigner un job à un utilisateur.");
    public static UNASSIGN_JOB = new JobPermission(1 << 3, "Désassigner un job", "Désassigner un job d'un utilisateur.");
    public static DELETE_JOB = new JobPermission(1 << 4, "Supprimer un job", "Supprimer un job.");
    public static UPDATE_JOB = new JobPermission(1 << 5, "Mettre à jour un job", "Mettre à jour un job.");
    public static UPDATE_JOB_PERMISSIONS = new JobPermission(1 << 6, "Mettre à jour les permissions d'un job", "Mettre à jour les permissions d'un job.");
    public static VIEW_ADMINISTRATION_PANEL = new JobPermission(1 << 7, "Voir le panneau d'administration", "Voir le panneau d'administration.");

    public constructor(private readonly bit: number, private readonly name: string, private readonly description: string) {
    }

    public get permissionBit(): number {
        return this.bit;
    }

    public get permissionName(): string {
        return this.name;
    }
}

export const updateJob = async (
    jobId: string,
    name: string
): Promise<void> => {
    try {
        await baseClient.put(
            `/api/jobs/${jobId}`,
            {
                name,
            });
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const createJob = async (
    name: string
): Promise<Job> => {
    try {
        const response = await baseClient.post(
            `/api/jobs`,
            {
                name,
            });
        return response.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getJobForUser = async (userId: string): Promise<Job[]> => {
    try {
        const {data} = await baseClient.get(`/api/job/user/${userId}`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const assignJob = async (
    userId: string,
    jobId: string
): Promise<void> => {
    try {
        await baseClient.post(
            `/api/job/assign`,
            {
                userId,
                jobId,
            });
    } catch (e) {
        console.error(e);
        throw e;
    }
}


export const unassignJob = async (
    userId: string,
    jobId: string
): Promise<void> => {
    try {
        await baseClient.post(
            `/api/job/unassign`,
            {
                userId,
                jobId,
            });
    } catch (e) {
        console.error(e);
        throw e;
    }
}

