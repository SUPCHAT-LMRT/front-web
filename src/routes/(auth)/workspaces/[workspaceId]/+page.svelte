<script lang="ts">
    import {page} from "$app/state";

    let currentWorkspaceId = $derived(page.params.workspaceId);
</script>

<h1 class="flex justify-center items-center h-full text-xl text-red-800">
    A FAIRE: Une page qui présente le workspace {currentWorkspaceId} avec des actions rapide comme l'invitation de membre,
    des stats...
</h1>
