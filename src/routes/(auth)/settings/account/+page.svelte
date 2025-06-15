<script lang="ts">
    import {page} from "$app/state";
    import {exportUserData, requestResetPassword} from "$lib/api/user";
    import ProfileCard from "$lib/components/app/settings/ProfileCard.svelte";
    import {Button} from "$lib/components/ui/button";
    import {error, success} from "$lib/toast/toast";
    import type {AuthenticatedUserState} from "../../authenticatedUser.svelte";
    import {Download} from "lucide-svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

    const {authenticatedUserState} = page.data as {
        authenticatedUserState: AuthenticatedUserState;
    };
    const authenticatedUser = $derived(authenticatedUserState.user);

    const handlePasswordChange = async () => {
        try {
            await requestResetPassword();
            success(
                "Réinitialisation de mot de passe",
                "Un email de réinitialisation de mot de passe a été envoyé.",
            );
        } catch (e) {
            console.error(e);
            error(
                "Erreur",
                "Une erreur est survenue lors de la réinitialisation de mot de passe.",
            );
        }
    };

    const handleExportData = async () => {
        try {
            await exportUserData(authenticatedUser.id);
            success("Export réussi", "Vos données ont été exportées avec succès.");
        } catch (e) {
            console.error(e);
            error("Erreur", "Une erreur est survenue lors de l'exportation de vos données.");
        }
    };

</script>

<section class="px-4 py-2 ml-2 pt-8 ">
    <ProfileCard {authenticatedUser}/>

    <h2 class="text-gray-700 text-xs font-bold mt-7 uppercase dark:text-gray-200">
        Gestion des données
    </h2>
    <p class="text-gray-700 text-sm mt-3 dark:text-gray-300">
        Supprimer vos données signifie que vous ne pourrez plus les récupérer.
    </p>
    <div class="flex flex-col w-[50%] mt-3">
        <Button variant="outline" size="sm" class="mb-2 w-[60%]" onclick={handleExportData}>
            <Download />
            Exporter mes données
        </Button>

        <AlertDialog.Root >
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>Etes-vous sûr ?</AlertDialog.Title>
                    <AlertDialog.Description>
                        Cette action supprimera définitivement vos données de l'application. Vous ne pourrez pas
                        les récupérer.
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Annuler</AlertDialog.Cancel>
                    <AlertDialog.Action class="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors">Supprimer</AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </div>


    <h2 class="text-gray-700 text-xs font-bold mt-7 uppercase dark:text-gray-200">
        Changement de mot de passe
    </h2>
    <p class="text-gray-700 text-sm mt-3 dark:text-gray-300">
        Changer ton mot de passe signifie que tu ne pourras plus le récupérer.
    </p>
    <Button
            onclick={handlePasswordChange}
            variant="outline" size="sm" class="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors mt-3"
    >
        Changer le mot de passe
    </Button>
</section>
