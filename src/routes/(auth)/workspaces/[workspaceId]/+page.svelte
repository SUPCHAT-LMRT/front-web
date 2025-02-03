<script lang="ts">
    import {page} from "$app/state";

    let currentWorkspaceId = $derived(page.params.workspaceId);
</script>

<div>
    Information sur le workspace {currentWorkspaceId}
</div>