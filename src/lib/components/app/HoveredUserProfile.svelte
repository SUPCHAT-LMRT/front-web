<script lang="ts">
    import {getUserProfile, type UserProfile} from "$lib/api/user";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import * as Avatar from "$lib/components/ui/avatar";
    import {fallbackAvatarLetters} from "$lib/utils/fallbackAvatarLetters";
    import {Skeleton} from "$lib/components/ui/skeleton";

    type Props = {
        userId: string,
        children?: () => any
    }

    const {userId, children}: Props = $props();
</script>

<div class="relative group">
    <div class="absolute hidden group-hover:block z-10 translate-y-8 bg-white text-black rounded-lg px-2 py-4">

        {#await getUserProfile(userId)}
            <div class="flex items-center gap-x-2">
                <Skeleton class="size-12 rounded-full"/>
                <Skeleton class="w-20 h-6 rounded-lg"/>
            </div>
        {:then userProfile}
            <div class="flex items-center gap-x-2">
                <Avatar.Root>
                    <Avatar.Image src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, userId)}
                                  alt="Avatar de {userProfile.firstName} {userProfile.lastName}"/>
                    <Avatar.Fallback class="text-white bg-gray-200 dark:bg-black">
                        {fallbackAvatarLetters(userProfile.firstName + " " + userProfile.lastName)}
                    </Avatar.Fallback>
                </Avatar.Root>

                <span>{userProfile.firstName} {userProfile.lastName}</span>
            </div>
        {:catch error}
            <div class="bg-red-200 dark:bg-red-700 w-20 h-20 rounded-full">{error}</div>
        {/await}
    </div>

    {@render children?.()}
</div>