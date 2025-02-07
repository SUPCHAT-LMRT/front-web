<script lang="ts">
    import {page} from "$app/state";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import CreateChannelDialog from "$lib/components/app/workspaces/CreateChannelDialog.svelte";
    import workspaceChannelsStore from "$lib/stores/workspaceChannelsStore";
    import InviteMemberDialog from "$lib/components/app/workspaces/InviteMemberDialog.svelte";
    import EditWorkspaceDialog from "$lib/components/app/workspaces/EditWorkspaceDialog.svelte";
    import {getWorkspaceMembers, type WorksapceMember} from "$lib/api/workspaces/workspace";

    let currentWorkspaceId = $derived(page.params.workspaceId);

    let createChannelData = $state({
        dialogOpen: false,
        name: "",
        topic: ""
    });

    let stats = [
        { label: "Membres", value: 42 },
        { label: "Canaux", value: 8 },
        { label: "Messages", value: 1245 }
    ];

    let members:WorksapceMember[] = $state([]);
    let channels = $state(workspaceChannelsStore.get());

    $effect(() => {
        defineMembers(currentWorkspaceId);
    });

    const defineMembers = async (workspaceid) => {
        members = await getWorkspaceMembers(workspaceid);
    }

    let recentActivities = [
        { user: "Alice", action: "a ajouté un nouveau canal #design" },
        { user: "Bob", action: "a rejoint le workspace" },
        { user: "Charlie", action: "a modifié les permissions" }
    ];

    const createChannel = async () => {
        try {
            await workspaceChannelsStore.create(currentWorkspaceId, createChannelData.name, createChannelData.topic);
            createChannelData = {
                dialogOpen: false,
                name: "",
                topic: ""
            }
        } catch (e) {
            console.error(e);
        }
    }

</script>

<div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">Workspace {currentWorkspaceId}</h1>

    <div class="flex gap-4 mb-6">
        <button class="bg-[#61A0AF] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#4B7986]">
            <InviteMemberDialog />
        </button>
        <button class="bg-[#61A0AF] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#4B7986]">
            <CreateChannelDialog {createChannelData} {createChannel} />
        </button>
        <button class="bg-[#61A0AF] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#4B7986]">
            <EditWorkspaceDialog />
        </button>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-6">
        {#each stats as stat}
            <div class="bg-gray-100 p-4 rounded-lg shadow-md text-center">
                <p class="text-xl font-semibold">{stat.value}</p>
                <p class="text-gray-600">{stat.label}</p>
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded-lg shadow-md">
            <h2 class="text-lg font-semibold mb-3">👥 Membres</h2>
            <ul>
                {#each members as member}
                    <li class="p-2 border-b">{member.pseudo}</li>
                {/each}
            </ul>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-md">
            <h2 class="text-lg font-semibold mb-3">📢 Canaux</h2>
            <ul>
                {#each channels.data.channels as channel}
                    <li class="p-2 border-b"># {channel.name}</li>
                {/each}
            </ul>
        </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md mt-6">
        <h2 class="text-lg font-semibold mb-3">📝 Activités récentes</h2>
        <ul>
            {#each recentActivities as activity}
                <li class="p-2 border-b">
                    <span class="font-semibold">{activity.user}</span> {activity.action}
                </li>
            {/each}
        </ul>
    </div>
</div>