<script lang="ts">
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { goto } from "$lib/utils/goto";
  import {
    Briefcase,
    Compass,
    MessageSquareMore,
    Moon,
    Settings,
    Sun,
  } from "lucide-svelte";

  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { useSidebar } from "$lib/components/ui/sidebar";
  import { toggleMode } from "mode-watcher";
  import type { AuthenticatedUserState } from "src/routes/(auth)/authenticatedUser.svelte";
  import { getS3ObjectUrl, S3Bucket } from "./api/s3";
  import { changeUserStatus, PrivateStatus } from "./api/user";
  import { cn } from "./utils";
  import { fallbackAvatarLetters } from "./utils/fallbackAvatarLetters";

  type Props = {
    authenticatedUserState: AuthenticatedUserState;
  };

  let selected = $derived(page.url.pathname.split("/")[1]);

  let { authenticatedUserState = $bindable() }: Props = $props();
  const sidebar = useSidebar();
  const authenticatedUser = $derived(authenticatedUserState.user);

  function select(id: string) {
    if (id === "chat") goto("/chat");
    if (id === "workspaces") goto("/workspaces");
    if (id === "store") goto("/store");
    if (id === "settings") goto("/settings");
    if (id === "discover") goto("/discover");
  }

  const selectStatus = (s: PrivateStatus) => {
    changeUserStatus(s).then(() => {
      authenticatedUserState.user.status = s;
    });
  };
</script>

<Sidebar.Root class="h-full w-24 flex flex-col items-center">
  <Sidebar.Content class="pt-4 dark:bg-gray-900">
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col items-center">
          <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
            <Sidebar.MenuButton
              class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "chat"
                  ? "bg-primary dark:bg-primary shadow-["
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
              class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "workspaces"
                  ? "bg-primary shadow-md"
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
              class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "settings"
                  ? "bg-primary shadow-md"
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
              class={` hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                selected === "discover"
                  ? "bg-primary shadow-md"
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

          <Sidebar.MenuItem>
            <Button onclick={toggleMode} variant="outline" size="icon">
              <Sun
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Moon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer class="pt-4 dark:bg-gray-900">
    <Sidebar.Menu>
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
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
