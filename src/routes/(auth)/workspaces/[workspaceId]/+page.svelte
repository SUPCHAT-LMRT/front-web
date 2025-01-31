<script lang="ts">
    import {page} from "$app/state";

    let workspaceId: string = $state();

    $effect(() => {
        workspaceId = page.params.workspaceId;
    })
</script>

<div class="w-full">
    <span>{workspaceId}</span>
</div>