<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import RoleCreator from "$lib/components/app/workspaces/RoleCreator.svelte";
  import RolePermissions from "$lib/components/app/workspaces/RolePermissions.svelte";
  import RolesList from "$lib/components/app/workspaces/RoleList.svelte";
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "$lib/components/ui/dialog";

  let selectedRoleId: number | null = 1;
  let showModal = false;

  const handleRoleSelect = (roleId: number) => {
    selectedRoleId = roleId;
  };

  const handleSave = () => {
    console.log("Saving roles settings");
  };

  const handleRoleCreated = (role) => {
    console.log("New role created:", role);
    showModal = false; // Ferme le modal après la création du rôle
  };
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-semibold">Gestion des Rôles</h2>
    <Button class="text-white"  onclick={handleSave}>Sauvegarder</Button>
  </div>

  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="md:col-span-1">
            <Card class="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Rôles</CardTitle>
                    <CardDescription>Sélectionnez un rôle pour modifier ses permissions</CardDescription>
                </CardHeader>
                <CardContent class="flex-grow">
                    <RolesList {handleRoleSelect} {selectedRoleId} />
                </CardContent>
                <div class="p-4 flex justify-end">
                    <Button class="text-white" onclick={() => (showModal = true)}>Créer un rôle</Button>
                </div>
            </Card>
        </div>

      <div class="md:col-span-2">
        <Card class="h-full">
          <CardHeader>
            <CardTitle>Permissions des rôles</CardTitle>
            <CardDescription>Configurez les permissions pour le rôle sélectionné</CardDescription>
          </CardHeader>
          <CardContent>
            {#if selectedRoleId}
              <RolePermissions roleId={selectedRoleId} />
            {:else}
              <div class="text-center py-8 text-muted-foreground">
                Sélectionnez un rôle pour voir ses permissions
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

</div>

<!-- Modal pour créer un rôle -->
{#if showModal}
  <Dialog open={showModal} onOpenChange={(open) => (showModal = open)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Créer un nouveau rôle</DialogTitle>
      </DialogHeader>
      <RoleCreator onRoleCreated={handleRoleCreated} />
    </DialogContent>
  </Dialog>
{/if}
