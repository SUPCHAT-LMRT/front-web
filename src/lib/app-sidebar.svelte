<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import {
        MessageSquareMore,
        Briefcase,
        User,
        Compass,
        Settings
    } from "lucide-svelte";

    let selected = 'business';

    function select(id: string) {
        selected = id;
    }
</script>

<Sidebar.Root class="w-24 flex flex-col items-center">
    <Sidebar.Content class="mt-4">
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu class="flex flex-col items-center">
                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-[#96C9DC] flex items-center justify-center h-14 w-14 transition-all duration-300 ${
                                selected === 'messages' ? 'bg-[#61A0AF] shadow-md' : 'bg-gray-200'
                            }`}
                                onclick={() => select('messages')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <MessageSquareMore class={`${selected === 'messages' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-1 text-xs text-center">Chat</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-[#96C9DC] flex items-center justify-center h-14 w-14 transition-all duration-300 ${
                                selected === 'business' ? 'bg-[#61A0AF] shadow-md' : 'bg-gray-200'
                            }`}
                                onclick={() => select('business')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <Briefcase class={`${selected === 'business' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-1 text-xs text-center">Server</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-[#96C9DC] flex items-center justify-center h-14 w-14 transition-all duration-300 ${
                                selected === 'user' ? 'bg-[#61A0AF] shadow-md' : 'bg-gray-200'
                            }`}
                                onclick={() => select('user')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <User class={`${selected === 'user' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-1 text-xs text-center">User</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={`hover:bg-[#96C9DC] flex items-center justify-center h-14 w-14 transition-all duration-300 ${
                                selected === 'settings' ? 'bg-[#61A0AF] shadow-md' : 'bg-gray-200'
                            }`}
                                onclick={() => select('settings')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <Settings class={`${selected === 'settings' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-1 text-xs text-center">Settings</span>
                    </Sidebar.MenuItem>

                    <Sidebar.MenuItem class="mb-4 flex flex-col items-center">
                        <Sidebar.MenuButton
                                class={` hover:bg-[#96C9DC] flex items-center justify-center h-14 w-14 transition-all duration-300 ${
                                selected === 'compass' ? 'bg-[#61A0AF] shadow-md' : 'bg-gray-200'
                            }`}
                                onclick={() => select('compass')}
                        >
                            <div class="h-12 w-12 flex justify-center items-center">
                                <Compass class={`${selected === 'compass' ? 'text-white' : 'text-gray-600'}`}/>
                            </div>
                        </Sidebar.MenuButton>
                        <span class="mt-1 text-xs text-center">Discover</span>
                    </Sidebar.MenuItem>
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
</Sidebar.Root>
