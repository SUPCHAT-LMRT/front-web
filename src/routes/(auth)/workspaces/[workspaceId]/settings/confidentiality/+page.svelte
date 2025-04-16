<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import { AlertTriangle } from "lucide-svelte";

  let isPublic = false;

  const handleSave = () => {
    console.log("Saving confidentiality settings:", { isPublic });
  };
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-semibold">Confidentialité du Workspace</h2>
    <Button class="text-white" onclick={handleSave}>Sauvegarder</Button>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Confidentialité de l'espace de travail</CardTitle>
      <CardDescription>Définissez qui peut accéder à votre espace de travail</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label for="public-mode">Mode Public</Label>
          <p class="text-sm text-muted-foreground">
            {#if isPublic}
              Votre espace de travail est visible par tous
            {:else}
              Votre espace de travail est privé et accessible sur invitation uniquement
            {/if}
          </p>
        </div>
        <Switch id="public-mode" bind:checked={isPublic} />
      </div>

      <div class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <div class="flex">
          <AlertTriangle class="h-5 w-5 text-yellow-800 dark:text-yellow-500" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-500">Attention</h3>
            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              <p>
                En mode public, n'importe qui peut trouver et rejoindre votre espace de travail. Assurez-vous que c'est
                bien ce que vous souhaitez.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
