<script lang="ts">
    import { onMount } from "svelte";
    import workspacesStore from "$lib/stores/workspacesStore";
    import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";

    let workspaces = $state([]);

    onMount(async () => {
        const result = await workspacesStore.fetchDiscover();
        workspaces = result.workspaces;
    });
</script>

<div class="flex flex-col w-full h-full dark:bg-gray-800">
    <div class="bg-gradient-to-r from-primary from-50% to-[#94bfc9] text-white py-16 px-8">
        <div class="max-w-6xl mx-auto">
            <h1 class="text-5xl font-extrabold tracking-wide mb-6">
                TROUVE TON
                <br />
                SERVEUR
                <br />
                SUR SUPCHAT-LMRT
            </h1>
            <p class="text-gray-300 text-lg max-w-2xl">
                Des jeux vidéo à la pédagogie, en passant par la musique, tu trouveras toujours chaussure à ton pied.
            </p>
        </div>
    </div>
    <div class="text-gray-800 dark:text-white flex-1 py-8 px-8">
        <div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold mb-6">Serveurs du moment</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {#each workspaces as workspace (workspace.id)}
                <div class="bg-[#2a2a2a] rounded-lg overflow-hidden">
                    <div class="h-40 relative overflow-hidden">
                        <img
                                src="{getS3ObjectUrl(S3Bucket.WORKSPACES_BANNERS, workspace.id)}"
                                alt={`Workspace banner ${workspace.id}`}
                                class="object-cover w-full h-full"
                        />
                    </div>
                    <div class="p-4">
                        <div class="flex items-center mb-3">
                            <div class="w-10 h-10 bg-gray-700 rounded-full overflow-hidden relative mr-3 flex-shrink-0">
                                <img
                                        src="{getS3ObjectUrl(S3Bucket.WORKSPACES_ICONS, workspace.id)}"
                                        alt={`Workspace icon ${workspace.id}`}
                                        class="object-cover rounded"
                                />
                            </div>
                            <h3 class="text-lg font-semibold">{workspace.name}</h3>
                        </div>

                        <p class="text-gray-400 text-sm mb-4 min-h-[80px]">Ceci est la description du serveur de titi, c'est un serveur pour faire mumuse !</p>

                        <div class="flex items-center text-xs text-gray-400">
                            <div class="flex items-center mr-4">
                                <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                <span>1000 en ligne</span>
                            </div>
                            <div class="flex items-center">
                                <span>2000 membres</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
