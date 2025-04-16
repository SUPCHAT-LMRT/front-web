<script lang="ts">
    import {Badge} from "$lib/components/ui/badge";
    import {ScrollArea} from "$lib/components/ui/scroll-area";
    import {Edit, Trash2} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";

    export let handleRoleSelect: (roleId: number) => void;
    export let selectedRoleId: number | null;

    const mockRoles = [
        {id: 1, name: "Administrateur", color: "#ef4444"},
        {id: 2, name: "Modérateur", color: "#3b82f6"},
        {id: 3, name: "Membre", color: "#22c55e"},
        {id: 4, name: "Invité", color: "#a855f7"},
    ];

    const handleDeleteRole = (roleId: number, event: Event) => {
        event.stopPropagation();
        console.log("Delete role:", roleId);
    };

    const handleEditRole = (roleId: number, event: Event) => {
        event.stopPropagation();
        console.log("Edit role:", roleId);
    };


</script>

<ScrollArea class="h-[300px] pr-4">
    <div class="space-y-2">
        {#each mockRoles as role}
            <button
                    type="button"
                    class="w-full flex items-center justify-between rounded-md p-2 text-left cursor-pointer transition
                  {selectedRoleId === role.id ? 'bg-accent' : 'hover:bg-accent/50'}"
                    onclick={() => handleRoleSelect(role.id)}
            >
                <div class="flex items-center gap-2">
                    <Badge style="background-color: {role.color}" class="text-white">
                        {role.name}
                    </Badge>
                </div>
                <div class="flex gap-1">
                    <Button variant="ghost" size="icon" class="h-7 w-7"
                            onclick={(event) => handleEditRole(role.id, event)}>
                        <Edit class="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" class="h-7 w-7"
                            onclick={(event) => handleDeleteRole(role.id, event)}>
                        <Trash2 class="h-4 w-4"/>
                    </Button>
                </div>
            </button>
        {/each}
    </div>
</ScrollArea>