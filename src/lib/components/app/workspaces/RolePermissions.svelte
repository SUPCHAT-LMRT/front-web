<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { onMount } from "svelte";

  export let roleId: number;

  const permissionCategories = [
    {
      id: "general",
      name: "Général",
      permissions: [
        { id: "view_channels", name: "Voir les canaux", description: "Permet de voir les canaux de l'espace de travail" },
        { id: "manage_channels", name: "Gérer les canaux", description: "Permet de créer, modifier et supprimer des canaux" },
        { id: "manage_roles", name: "Gérer les rôles", description: "Permet de créer, modifier et supprimer des rôles" },
      ],
    },
    {
      id: "messages",
      name: "Messages",
      permissions: [
        { id: "send_messages", name: "Envoyer des messages", description: "Permet d'envoyer des messages dans les canaux" },
        { id: "embed_links", name: "Intégrer des liens", description: "Permet d'intégrer des liens dans les messages" },
        { id: "attach_files", name: "Joindre des fichiers", description: "Permet de joindre des fichiers aux messages" },
        { id: "mention_everyone", name: "Mentionner @everyone", description: "Permet de mentionner tous les membres de l'espace de travail" },
      ],
    },
    {
      id: "moderation",
      name: "Modération",
      permissions: [
        { id: "kick_members", name: "Expulser des membres", description: "Permet d'expulser des membres de l'espace de travail" },
        { id: "ban_members", name: "Bannir des membres", description: "Permet de bannir des membres de l'espace de travail" },
        { id: "manage_messages", name: "Gérer les messages", description: "Permet de supprimer ou d'épingler des messages" },
        { id: "view_audit_log", name: "Voir les logs d'audit", description: "Permet de voir l'historique des actions sur l'espace de travail" },
      ],
    },
  ];

  const rolePermissionsMap: Record<number, string[]> = {
    1: ["view_channels", "send_messages", "embed_links", "attach_files", "manage_channels", "manage_roles", "kick_members", "ban_members", "manage_messages", "view_audit_log"],
    2: ["view_channels", "send_messages", "embed_links", "attach_files", "kick_members", "manage_messages"],
    3: ["view_channels", "send_messages", "embed_links", "attach_files"],
    4: ["view_channels", "send_messages"],
  };

  let selectedPermissions: string[] = [];

  onMount(() => {
    selectedPermissions = rolePermissionsMap[roleId] || [];
  });

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      selectedPermissions = selectedPermissions.filter((id) => id !== permissionId);
    } else {
      selectedPermissions = [...selectedPermissions, permissionId];
    }
  };
</script>

<ScrollArea class="h-[500px] pr-4">
  <div class="space-y-6">
    {#each permissionCategories as category, index}
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{category.name}</h3>
        <div class="space-y-3">
          {#each category.permissions as permission}
            <div class="flex items-start space-x-2">
              <Checkbox
                id={`${roleId}-${permission.id}`}
                checked={selectedPermissions.includes(permission.id)}
                on:change={() => togglePermission(permission.id)}
              />
              <div class="grid gap-1.5 leading-none">
                <Label
                  for={`${roleId}-${permission.id}`}
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {permission.name}
                </Label>
                <p class="text-sm text-muted-foreground">{permission.description}</p>
              </div>
            </div>
          {/each}
        </div>
        {#if index !== permissionCategories.length - 1}
          <Separator class="my-2" />
        {/if}
      </div>
    {/each}
  </div>
</ScrollArea>