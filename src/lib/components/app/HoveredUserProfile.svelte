<script lang="ts">
    import {getUserProfile, type UserProfile} from "$lib/api/user";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import * as Avatar from "$lib/components/ui/avatar";
    import {fallbackAvatarLetters} from "$lib/utils/fallbackAvatarLetters";
    import {Skeleton} from "$lib/components/ui/skeleton";
    import {fade} from "svelte/transition";
    import {MessageCircle, Phone, Video} from "lucide-svelte";

    type Props = {
        userId: string,
        children?: () => any
    }

    const {userId, children}: Props = $props();

    let hovered = $state(true);
</script>

<div class="relative group"
     onmouseenter={() => hovered = true}
     onmouseleave={() => hovered = false}
     role="button"
     tabindex="-1"
>
    <div class="absolute hidden group-hover:block z-10 bg-white dark:bg-gray-800 text-black shadow-box-lg shadow-gray-300 dark:shadow-gray-900 rounded-lg px-2 py-4">
        {#if hovered}
            <div transition:fade>
                {#await getUserProfile(userId)}
                    <div class="flex items-center gap-x-2">
                        <Skeleton class="size-12 rounded-full"/>
                        <Skeleton class="w-20 h-6 rounded-lg"/>
                    </div>
                {:then userProfile}
                    <div class="flex flex-col gap-y-4">
                        <div class="flex items-center gap-x-2">
                            <Avatar.Root>
                                <Avatar.Image src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, userId)}
                                              alt="Avatar de {userProfile.firstName} {userProfile.lastName}"/>
                                <Avatar.Fallback class="text-white bg-primary">
                                    {fallbackAvatarLetters(userProfile.firstName + " " + userProfile.lastName)}
                                </Avatar.Fallback>
                            </Avatar.Root>

                            <span class="text-black dark:text-white">{userProfile.firstName} {userProfile.lastName}</span>
                        </div>

                        <!-- Quick actions -->
                        <div class="flex items-center gap-x-4 text-gray-600 dark:text-gray-400">
                            <button title="Envoyer un message">
                                <MessageCircle strokeWidth={1.5}/>
                            </button>
                            <button title="Appeler">
                                <Phone strokeWidth={1.5}/>
                            </button>
                            <button title="Vidéo">
                                <Video strokeWidth={1.5}/>
                            </button>
                        </div>

                        <!-- More details -->
                        <div class="flex flex-col gap-y-2">
                            <div class="flex items-center gap-x-2">
                                <span class="text-gray-600 dark:text-gray-400">Email:</span>
                                <a href="mailto:{userProfile.email}" class="text-black dark:text-white">{userProfile.email}</a>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <span class="text-gray-600 dark:text-gray-400">Poste:</span>
                                <span class="text-black dark:text-white">{userProfile?.poste ?? "Aucun poste"}</span>
                            </div>
                        </div>
                    </div>
                {:catch error}
                    <div class="text-red-700">{error}</div>
                {/await}
            </div>

        {/if}
    </div>

    {@render children?.()}
</div>