<script>
    import {Button} from "$lib/components/ui/button";
</script>

<section class="px-4 py-2 ml-2 pt-8 w-[500px]">
    <h1 class="text-gray-700 text-lg font-semibold">Mot de passe et authentification</h1>
    <p class="text-gray-700 text-sm mt-3">Changer ton mot de passe signifie que tu ne pourras plus le récupérer.</p>
    <Button class="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors h-8 mt-3">
        Changer le mot de passe
    </Button>

    <h2 class="text-gray-700 text-xs font-bold mt-7 uppercase">Suppression du compte</h2>
    <p class="text-gray-700 text-sm mt-3">Supprimer ton compte signifie que tu ne pourras plus le récupérer.</p>
    <Button class="bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors h-8 mt-3 mb-10">
        Supprimer le compte
    </Button>
</section>