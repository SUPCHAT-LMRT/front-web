<script lang="ts">
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { goto } from "$lib/utils/goto";
  import { Inbox } from "lucide-svelte";
  import {
    Briefcase,
    Compass,
    LogOut,
    MessageSquareMore,
    Moon,
    Settings,
    ShieldPlus,
    Sun,
  } from "lucide-svelte";

  import { checkUserPermission, JobPermission } from "$lib/api/admin";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { useSidebar } from "$lib/components/ui/sidebar";
  import { toggleMode } from "mode-watcher";
  import type { AuthenticatedUserState } from "src/routes/(auth)/authenticatedUser.svelte";
  import { getS3ObjectUrl, S3Bucket } from "./api/s3";
  import { changeUserStatus, getUserProfile, PrivateStatus } from "./api/user";
  import { cn } from "./utils";
  import { fallbackAvatarLetters } from "./utils/fallbackAvatarLetters";
  import Logodark from "$lib/assets/logo/Logodark.svelte";
  import { mode } from "mode-watcher";
  import Logo from "$lib/assets/logo/Logo.svelte";
  import { onMount, onDestroy } from "svelte";
  import { getNotifications, markNotificationAsRead, type Notification } from "./api/notification";
  import { getWorkspace } from "./api/workspaces/workspace";
  import { getGroup, getWorkspaceChannel } from "./api/workspaces/channels";

  type Props = {
    authenticatedUserState: AuthenticatedUserState;
  };

  let selected = $derived(page.url.pathname.split("/")[1]);

  let { authenticatedUserState = $bindable() }: Props = $props();
  const sidebar = useSidebar();
  const authenticatedUser = $derived(authenticatedUserState.user);
  let hasAdminPermission = $state(false);
  let notifications = $state<Notification[]>([]);
  let notificationInterval: number;
  let userCache = $state<Record<string, any>>({});
  let workspaceCache = $state<Record<string, string>>({});
  let channelCache = $state<Record<string, string>>({});
  let groupCache = $state<Record<string, string>>({});

  onMount(async () => {
    if (authenticatedUser) {
      await fetchNotifications();
      checkUserPermission(
        authenticatedUser.id,
        JobPermission.VIEW_ADMINISTRATION_PANEL.permissionBit,
      ).then((hasPermission) => {
        hasAdminPermission = hasPermission;
      });
      notificationInterval = setInterval(fetchNotifications, 10000);//polling toutes les 10s
    }
  });

  onDestroy(() => {
    if (notificationInterval) clearInterval(notificationInterval);
  });

  async function fetchNotifications() {
    try {
      notifications = await getNotifications();

      // Récupération des informations utilisateur pour les expéditeurs
      for (const notification of notifications) {
        if (notification.type === "direct_message" && notification.direct_message_data?.SenderId) {
          if (!userCache[notification.direct_message_data.SenderId]) {
            try {
              const user = await getUserProfile(notification.direct_message_data.SenderId);
              userCache[notification.direct_message_data.SenderId] = user;
            } catch (error) {
              console.error("Error fetching user:", error);
            }
          }
        } else if (notification.type === "channel_message" && notification.channel_message_data) {
          // Récupérer l'utilisateur expéditeur
          if (notification.channel_message_data.SenderId && !userCache[notification.channel_message_data.SenderId]) {
            try {
              const user = await getUserProfile(notification.channel_message_data.SenderId);
              userCache[notification.channel_message_data.SenderId] = user;
            } catch (error) {
              console.error("Error fetching user:", error);
            }
          }

          // Récupérer les infos du workspace
          const workspaceId = notification.channel_message_data.WorkspaceId;
          if (!workspaceCache[workspaceId]) {
            try {
              const workspace = await getWorkspace(workspaceId);
              workspaceCache[workspaceId] = workspace.name;
            } catch (error) {
              console.error("Error fetching workspace:", error);
              workspaceCache[workspaceId] = `Workspace ${workspaceId}`;
            }
          }

          // Récupérer les infos du canal
          const channelId = notification.channel_message_data.ChannelId;
          const cacheKey = channelId;
          if (!channelCache[cacheKey]) {
            try {
              const channel = await getWorkspaceChannel(workspaceId, channelId);
              channelCache[cacheKey] = channel.name;
            } catch (error) {
              console.error("Error fetching channel:", error);
              channelCache[cacheKey] = `Canal ${channelId}`;
            }
          }
        } else if (notification.type === "workspace_invite" && notification.workspace_invite_data) {
          if (notification.workspace_invite_data.InviterId && !userCache[notification.workspace_invite_data.InviterId]) {
            try {
              const user = await getUserProfile(notification.workspace_invite_data.InviterId);
              userCache[notification.workspace_invite_data.InviterId] = user;
            } catch (error) {
              console.error("Error fetching user:", error);
            }
          }
        }   else if (notification.type === "group_message" && notification.group_message_data) {
          // Récupérer l'utilisateur expéditeur
          if (notification.group_message_data.SenderId && !userCache[notification.group_message_data.SenderId]) {
            try {
              const user = await getUserProfile(notification.group_message_data.SenderId);
              userCache[notification.group_message_data.SenderId] = user;
            } catch (error) {
              console.error("Error fetching user:", error);
            }
          }
          // Récupérer les infos du groupe (à adapter selon ton API)
          const groupId = notification.group_message_data.GroupId;
          if (!groupCache[groupId]) {
            try {
              const group = await getGroup(groupId); // À créer dans tes fonctions API
              groupCache[groupId] = group.name;
            } catch (error) {
              console.error("Error fetching group:", error);
              groupCache[groupId] = `Groupe ${groupId}`;
            }
          }
        }
      }
    } catch (error) {
      console.error('There was a problem fetching notifications:', error);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    try {
      // 1. Marquer la notification comme lue
      await markNotificationAsRead(notification.id);

      // 2. Supprimer la notification de l'affichage local
      notifications = notifications.filter(n => n.id !== notification.id);

      // 3. Redirection selon le type de notification
      switch (notification.type) {
        case "direct_message":
          if (notification.direct_message_data?.SenderId) {
            goto(`/chat/direct/${notification.direct_message_data.SenderId}`);
          }
          break;

        case "channel_message":
          if (notification.channel_message_data?.WorkspaceId && notification.channel_message_data?.ChannelId) {
            goto(`/workspaces/${notification.channel_message_data.WorkspaceId}/channels/${notification.channel_message_data.ChannelId}`);
          }
          break;

        case "workspace_invite":
          if (notification.workspace_invite_data?.WorkspaceId) {
            goto(`/workspaces/${notification.workspace_invite_data.WorkspaceId}`);
          }
          break;

        case "group_message":
          if (notification.group_message_data?.GroupId) {
            goto(`/groups/${notification.group_message_data.GroupId}`);
          }
          break;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }

    await fetchNotifications();//refetch les notifs après ouverture
  }

  function select(id: string) {
    if (id === "chat") goto("/chat");
    if (id === "workspaces") goto("/workspaces");
    if (id === "store") goto("/store");
    if (id === "settings") goto("/settings");
    if (id === "discover") goto("/discover");
    if (id === "admin") goto("/admin");
  }

  const selectStatus = (s: PrivateStatus) => {
    changeUserStatus(s).then(() => {
      authenticatedUserState.user.status = s;
    });
  };

  // Format de la date pour une meilleure lisibilité
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Fonction pour récupérer le nom d'affichage d'un utilisateur
  function getUserDisplayName(userId: string): string {
    if (!userId) return "Utilisateur inconnu";

    const user = userCache[userId];
    if (!user) {
      return "Utilisateur inconnu";
    }

    // Vérifier que les propriétés existent
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (!firstName && !lastName) {
      return user.username || user.pseudo || "Utilisateur inconnu";
    }

    return `${firstName} ${lastName}`.trim();
  }

  // Fonction pour générer le message de notification à afficher
  function getNotificationDisplayContent(notification: Notification): { title: string; subtitle: string; date: string } {
    const date = formatDate(notification.created_at);

    switch (notification.type) {
      case "direct_message":
        if (notification.direct_message_data?.SenderId) {
          const senderName = getUserDisplayName(notification.direct_message_data.SenderId);
          return {
            title: "Message privé",
            subtitle: `De ${senderName}`,
            date
          };
        }
        return { title: "Nouveau message privé", subtitle: "", date };

      case "channel_message":
        if (notification.channel_message_data) {
          const senderId = notification.channel_message_data.SenderId;
          const senderName = senderId ? getUserDisplayName(senderId) : "Utilisateur inconnu";

          const channelName = channelCache[notification.channel_message_data.ChannelId] ||
            `Canal ${notification.channel_message_data.ChannelId}`;

          const workspaceName = workspaceCache[notification.channel_message_data.WorkspaceId] ||
            `Workspace ${notification.channel_message_data.WorkspaceId}`;

          return {
            title: `Message de ${senderName}`,
            subtitle: `Dans le canal ${channelName} (${workspaceName})`,
            date
          };
        }
        return { title: "Nouveau message dans un canal", subtitle: "", date };

      case "workspace_invite":
        if (notification.workspace_invite_data) {
          const inviterId = notification.workspace_invite_data.InviterId;
          const inviterName = inviterId ? getUserDisplayName(inviterId) : "Un utilisateur";

          const workspaceName = workspaceCache[notification.workspace_invite_data.WorkspaceId] ||
            `Workspace ${notification.workspace_invite_data.WorkspaceId}`;

          return {
            title: "Invitation workspace",
            subtitle: `De ${inviterName} pour rejoindre ${workspaceName}`,
            date
          };
        }
        return { title: "Nouvelle invitation à un workspace", subtitle: "", date };

      case "group_message":
        if (notification.group_message_data) {
          const senderId = notification.group_message_data.SenderId;
          const senderName = senderId ? getUserDisplayName(senderId) : "Utilisateur inconnu";
          const groupName = groupCache[notification.group_message_data.GroupId] || `Groupe ${notification.group_message_data.GroupId}`;
          return {
            title: `Message de ${senderName}`,
            subtitle: `Dans le groupe ${groupName}`,
            date
          };
        }
        return { title: "Nouveau message dans un groupe", subtitle: "", date };

      default:
        return { title: "Nouvelle notification", subtitle: "", date };
    }
  }
</script>

<Sidebar.Root class="h-full max-w-max flex flex-col items-center relative">
  <Sidebar.Content class="pt-4 dark:bg-gray-900">
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col items-center">
          <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
            {#if mode.current === "dark"}
              <Logodark width={60} />
            {:else}
              <Logo width={60} />
            {/if}
          </Sidebar.MenuItem>
          <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
            <Sidebar.MenuButton
              class={`hover:bg-yellow-app/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "chat"
                  ? "bg-yellow-app dark:bg-primary shadow-["
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
              onclick={() => select("chat")}
            >
              <div class="h-12 w-12 flex justify-center items-center">
                <MessageSquareMore
                  class={`${selected === "chat" ? "text-white" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
            </Sidebar.MenuButton>
            <span class="mt-2 text-xs text-center">Messages privés</span>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
            <Sidebar.MenuButton
              class={`hover:bg-yellow-app/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "workspaces"
                  ? "bg-yellow-app dark:bg-primary shadow-md"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
              onclick={() => select("workspaces")}
            >
              <div class="h-12 w-12 flex justify-center items-center">
                <Briefcase
                  class={`${selected === "workspaces" ? "text-white" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
            </Sidebar.MenuButton>
            <span class="mt-2 text-xs text-center">Espace de travail</span>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
            <Sidebar.MenuButton
              class={`hover:bg-yellow-app/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "settings"
                  ? "bg-yellow-app dark:bg-primary shadow-md"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
              onclick={() => select("settings")}
            >
              <div class="h-12 w-12 flex justify-center items-center">
                <Settings
                  class={`${selected === "settings" ? "text-white" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
            </Sidebar.MenuButton>
            <span class="mt-2 text-xs text-center">Paramètres</span>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
            <Sidebar.MenuButton
              class={` hover:bg-yellow-app/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "discover"
                  ? "bg-yellow-app dark:bg-primary shadow-md"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
              onclick={() => select("discover")}
            >
              <div class="h-12 w-12 flex justify-center items-center">
                <Compass
                  class={`${selected === "discover" ? "text-white" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
            </Sidebar.MenuButton>
            <span class="mt-2 text-xs text-center">Espaces publics</span>
          </Sidebar.MenuItem>

          {#if hasAdminPermission}
            <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
              <Sidebar.MenuButton
                class={`hover:bg-yellow-app/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                  selected === "admin"
                    ? "bg-yellow-app dark:bg-primary shadow-md"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
                onclick={() => select("admin")}
              >
                <div class="h-12 w-12 flex justify-center items-center">
                  <ShieldPlus
                    class={`${selected === "admin" ? "text-white" : "text-gray-600 dark:text-gray-400"}`}
                  />
                </div>
              </Sidebar.MenuButton>
              <span class="mt-2 text-xs text-center">Admin</span>
            </Sidebar.MenuItem>
          {/if}

        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer class="pt-4 dark:bg-gray-900">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Sidebar.MenuButton class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-4">
              <div class="mx-auto relative size-12 flex items-center justify-center">
                <Inbox class="h-6 w-6" />
                <!-- Indicateur de nouvelles notifications -->
                {#if notifications.length > 0}
                  <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                {/if}
              </div>
            </Sidebar.MenuButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content side={sidebar.isMobile ? "top" : "right"} class="min-w-[300px] max-h-[400px] overflow-y-auto">
            <DropdownMenu.Group>
              <DropdownMenu.GroupHeading class="px-4 py-2 font-semibold">Notifications</DropdownMenu.GroupHeading>
              {#each notifications as notification}
                {@const content = getNotificationDisplayContent(notification)}
                <DropdownMenu.Item
                  class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 my-1 rounded-md"
                  onclick={() => handleNotificationClick(notification)}>
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-start">
                      <span class="font-semibold text-gray-800 dark:text-gray-200">{content.title}</span>
                    </div>
                    {#if content.subtitle}
                      <span class="text-sm text-gray-700 dark:text-gray-300">{content.subtitle}</span>
                    {/if}
                    <span class="text-xs text-gray-500">{content.date}</span>
                  </div>
                </DropdownMenu.Item>
              {:else}
                <DropdownMenu.Item class="cursor-pointer px-4 py-2 text-sm text-gray-500">
                  Aucune notification
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
      <Sidebar.MenuItem>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Sidebar.MenuButton
                      {...props}
                      class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-6"
              >
                <div class="mx-auto relative size-12 flex items-center">
                  <Avatar.Root class="rounded-full">
                    <Avatar.Image
                            src={getS3ObjectUrl(
                        S3Bucket.USERS_AVATARS,
                        authenticatedUser.id,
                      )}
                            alt="Photo de profile"
                    />
                    <Avatar.Fallback
                    >{fallbackAvatarLetters(
                            authenticatedUser.firstName +
                            " " +
                            authenticatedUser.lastName,
                    )}</Avatar.Fallback
                    >
                  </Avatar.Root>

                  <span
                          class={cn("rounded-full absolute bottom-1 right-2 size-3", {
                      "bg-green-500":
                        authenticatedUser.status === PrivateStatus.ONLINE,
                      "bg-yellow-500":
                        authenticatedUser.status === PrivateStatus.AWAY,
                      "bg-red-500":
                        authenticatedUser.status ===
                        PrivateStatus.DO_NOT_DISTURB,
                      "bg-gray-500":
                        authenticatedUser.status === PrivateStatus.OFFLINE ||
                        authenticatedUser.status === PrivateStatus.INVISIBLE,
                    })}
                  >
                  </span>
                </div>
              </Sidebar.MenuButton>
            {/snippet}
          </DropdownMenu.Trigger>

          <!-- dropdown for switching status -->
          <DropdownMenu.Content
                  side={sidebar.isMobile ? "top" : "right"}
                  class="min-w-[200px]"
          >
            <DropdownMenu.Group>
              <DropdownMenu.GroupHeading>Status</DropdownMenu.GroupHeading>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick={() => selectStatus(PrivateStatus.ONLINE)}
              >
                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                Connecté
              </DropdownMenu.Item>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick={() => selectStatus(PrivateStatus.AWAY)}
              >
                <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Absent
              </DropdownMenu.Item>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick={() => selectStatus(PrivateStatus.DO_NOT_DISTURB)}
              >
                <span class="w-3 h-3 bg-red-500 rounded-full"></span>
                Ne pas déranger
              </DropdownMenu.Item>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick={() => selectStatus(PrivateStatus.INVISIBLE)}
              >
                <span class="w-3 h-3 bg-gray-500 rounded-full"></span>
                Invisible
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator class="my-1" />
            <DropdownMenu.Group>
              <DropdownMenu.GroupHeading>Autres</DropdownMenu.GroupHeading>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick={() => select("settings")}
              >
                <Settings class="w-4 h-4" />
                Paramètres
              </DropdownMenu.Item>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onclick={toggleMode}
              >
                <div class="relative w-4 h-4 flex items-center justify-center">
                  <Sun
                          class="absolute h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                  />
                  <Moon
                          class="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                  />
                </div>
                Changer le thème
              </DropdownMenu.Item>
              <DropdownMenu.Item
                      class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:!bg-red-500 hover:!text-destructive-foreground"
                      onclick={() => goto("/logout")}
              >
                <LogOut class="w-4 h-4" />
                Déconnexion
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
