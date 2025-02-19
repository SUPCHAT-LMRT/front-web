<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import {
        MessageSquareMore,
        Briefcase,
        ShoppingCart,
        Compass,
        Settings
    } from "lucide-svelte";
    import { goto } from "$lib/utils/goto";
    import {page} from "$app/state";
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";

    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";

    let selected = page.url.pathname.split("/")[1];

    function select(id: string) {
        if (id === "chat") goto("/chat");
        if (id === "workspaces") goto("/workspaces");
        if (id === "store") goto("/store");
        if (id === "settings") goto("/settings");
        if (id === "discover") goto("/discover");
        selected = id;
    }
</script>

<Sidebar.Root class="w-24 flex flex-col items-center">
    <Sidebar.Content class="pt-4 dark:bg-gray-900">
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu class="flex flex-col items-center">
                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                                selected === 'chat' ? 'bg-primary dark:bg-primary shadow-[' : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                                onclick={() => select('chat')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <MessageSquareMore
                                        class={`${selected === 'chat' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}/>
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-2 text-xs text-center">Chat</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                                selected === 'workspaces' ? 'bg-primary shadow-md' : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                                onclick={() => select('workspaces')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <Briefcase class={`${selected === 'workspaces' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}/>
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-2 text-xs text-center">Server</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                                selected === 'settings' ? 'bg-primary shadow-md' : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                                onclick={() => select('settings')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <Settings class={`${selected === 'settings' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}/>
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-2 text-xs text-center">Settings</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={` hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                                selected === 'discover' ? 'bg-primary shadow-md' : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                                onclick={() => select('discover')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <Compass class={`${selected === 'discover' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}/>
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-2 text-xs text-center">Discover</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-primary/70 flex items-center justify-center h-12 w-12 transition-all duration-300 ${
                                selected === 'store' ? 'bg-primary shadow-md' : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                                onclick={() => select('store')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <ShoppingCart class={`${selected === 'store' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}/>
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-2 text-xs text-center">Boutique</span>
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
</Sidebar.Root>
