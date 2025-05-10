<script lang="ts">
    import {page} from "$app/state";
    import CreateChannelDialog from "$lib/components/app/workspaces/CreateChannelDialog.svelte";
    import workspaceChannelsStore from "$lib/stores/workspaceChannelsStore";
    import InviteMemberDialog from "$lib/components/app/workspaces/InviteMemberDialog.svelte";
    import {
        getWorkspaceDetails,
        getWorkspaceTimeSeries, updateWorkspaceBanner, type WorkspaceDetails,
    } from "$lib/api/workspaces/workspace";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {chart} from "$lib/actions/chart";
    import * as Avatar from "$lib/components/ui/avatar";
    import {fallbackAvatarLetters} from "$lib/utils/fallbackAvatarLetters";
    import {onMount} from "svelte";
    import ws from "$lib/api/ws";
    import type {Channel} from "$lib/api/workspaces/channels";
    import {ImageDown} from "lucide-svelte";
    import * as Dialog from '$lib/components/ui/dialog';
    import MembersList from "./MembersList.svelte";
    import type {ApexOptions} from "apexcharts";
    import * as ImageCropper from '$lib/components/extra/ui/image-cropper';
    import {getFileFromUrl} from '$lib/components/extra/ui/image-cropper';
    import {Button} from "$lib/components/ui/button";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let createChannelData = $state({
        dialogOpen: false,
        name: "",
        topic: ""
    });
    let currentWorkspaceDetails: WorkspaceDetails = $state(null);

    const defaultChartOptions: ApexOptions = {
        chart: {
            type: "area",
            width: "100%",
            height: "70%",
            toolbar: {
                show: false
            },
            animations: {
                enabled: true,
                dynamicAnimation: {
                    speed: 500
                }
            },
            zoom: {
                enabled: false
            },
            sparkline: {
                enabled: true
            }
        },
        noData: {
            text: "No data available",
            style: {
                fontSize: '14px',
                color: '#6c757d'
            }
        },
        series: [{data: []}],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        markers: {
            size: 0,
            hover: {
                size: 0
            }
        },
        tooltip: {
            enabled: false
        },
        xaxis: {
            labels: {
                show: false,
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
        },
        yaxis: {
            labels: {
                show: false,
            },
        },
        grid: {
            show: false,
            padding: {
                left: -10,
                right: -10,
            },
        }
    };

    let channels = $state(workspaceChannelsStore.get());
    let stats = $state([
        {label: "Messages", value: 0, chartOptions: defaultChartOptions},
        {label: "Visites", value: -1, chartOptions: defaultChartOptions},
        {label: "Membres", value: 0},
        {label: "Canaux", value: 0}
    ]);
    let forceRenderBanner = $state(Date.now());

    $effect(() => {
        getWorkspaceTimeSeries(currentWorkspaceId).getMinutelyMessageSents()
            .then((data) => {
                // response.data is as follow: [{"sentAt":"2025-02-11T18:14:00Z","count":1},{"sentAt":"2025-02-11T18:15:00Z","count":3}]
                // We need to transform it to the following format: [1, 3]
                // stats[0] is the "Messages" stat
                stats[0].chartOptions.series[0].data = data.map((item) => item.count);
            })
    });

    $effect(() => {
        getWorkspaceDetails(currentWorkspaceId).then(result => {
            currentWorkspaceDetails = result;
            stats[0].value = result.messagesCount;
            stats[2].value = result.membersCount;
            stats[3].value = result.channelsCount;
        });
    });

    $effect(() => {
        return ws.subscribe("workspace-updated", (msg) => {
            if (msg.workspaceId === currentWorkspaceId) {serveurcurrentWorkspaceDetails = {
                    ...currentWorkspaceDetails,
                    name: msg.name
                };
            }
        });
    });

    onMount(() => {
        return ws.subscribe("channel-created", msg => {
            const channelCreated = msg.channel as Channel;
            if (channelCreated.workspaceId !== currentWorkspaceId) return; // This is not supposed to happen but just in case (because it's handled by the server)
            stats[3].value++;
        })
    })

    let recentActivities = [
        {user: "Alice", action: "a ajouté un nouveau canal #design"},
        {user: "Bob", action: "a rejoint le workspace"},
        {user: "Charlie", action: "a modifié les permissions"}
    ];


    const updateBanner = async (file: File) => {
        try {
            await updateWorkspaceBanner(currentWorkspaceId, file);
            forceRenderBanner = Date.now();
        } catch (e) {
            console.error(e);
        }
    }

    const handleBannerCrop = async (url) => {
        const file = await getFileFromUrl(url);
        await updateBanner(file);
    }
</script>

{#if currentWorkspaceDetails}
    <div class="w-full h-full flex flex-col">
        <div class="flex-1 overflow-y-auto space-y-4">
            <div class="relative group">
                <img
                        src="{getS3ObjectUrl(S3Bucket.WORKSPACES_BANNERS, currentWorkspaceId)}?{forceRenderBanner}"
                        alt=""
                        class="w-full h-64 mb-6 object-cover bg-gray-200 dark:bg-gray-800"
                />

                <!-- TODO display only if the user has permission to edit the banner -->
                <div class="absolute bottom-0 right-0 p-4 hidden group-hover:block">
                    <ImageCropper.Root
                            onCropped={handleBannerCrop}
                    >
                        <ImageCropper.UploadTrigger>
                            <ImageDown class="w-6 h-6 text-gray-500 dark:text-gray-400 cursor-pointer"/>
                        </ImageCropper.UploadTrigger>
                        <ImageCropper.Dialog>
                            <ImageCropper.Cropper cropShape="rect" aspect={21 / 5}/>
                            <ImageCropper.Controls>
                                <ImageCropper.Cancel/>
                                <ImageCropper.Crop/>
                            </ImageCropper.Controls>
                        </ImageCropper.Dialog>
                    </ImageCropper.Root>
                </div>

                <Avatar.Root
                        class="absolute bottom-0 left-6 transform translate-y-1/2 w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <Avatar.Image
                            src={getS3ObjectUrl(S3Bucket.WORKSPACES_ICONS, currentWorkspaceId)}
                            alt={`Workspace ${currentWorkspaceId}`}
                            class="w-full h-full object-cover"
                    />
                    <Avatar.Fallback>
                        {fallbackAvatarLetters(currentWorkspaceDetails.name)}
                    </Avatar.Fallback>
                </Avatar.Root>
            </div>


            <div class="container mx-auto p-6">
                <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{currentWorkspaceDetails.name}</h1>

                <div class="flex justify-between items-center mb-6">
                    <div class="flex gap-4 mb-6">
                        <Button class="bg-primary dark:bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#4B7986] duration-300">
                            <InviteMemberDialog workspaceId={currentWorkspaceId}/>
                        </Button>
                    </div>
                    <div>
                        <Button href="/workspaces/{currentWorkspaceId}/settings/general" class="bg-primary dark:bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#4B7986] duration-300">
                            Paramètres
                        </Button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {#each stats as stat}
                        <div class="bg-gray-100 dark:bg-gray-800 shadow-md text-left border-[1px] dark:border-gray-800 rounded-lg">
                            <p class="font-semibold pl-4 pt-4">{stat.label}</p>
                            <p class="text-xl pl-4 pt-4">{stat.value}</p>
                            <div class="flex items-end">
                                {#if stat.chartOptions}
                                    <div use:chart={stat.chartOptions} class="w-full"></div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <MembersList workspaceId={currentWorkspaceId}/>

                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h2 class="text-lg font-semibold mb-3">📢 Canaux</h2>
                        <ul>
                            {#each channels.data.channels as channel}
                                <li class="p-2 border-b dark:border-gray-700"># {channel.name}</li>
                            {/each}
                        </ul>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mt-6">
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
        </div>
    </div>
{/if}