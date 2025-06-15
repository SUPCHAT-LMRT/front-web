<script lang="ts">
  import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
  import { PrivateStatus, updateUserAvatar, type User } from "$lib/api/user";
  import * as ImageCropper from "$lib/components/extra/ui/image-cropper";
  import { getFileFromUrl } from "$lib/components/extra/ui/image-cropper";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Card } from "$lib/components/ui/card";
  import { error, success } from "$lib/toast/toast";
  import { cn } from "$lib/utils";
  import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters.js";

  const { authenticatedUser }: { authenticatedUser: User } = $props();
  let forceRenderAvatar = $state(Date.now());

  const updateAvatar = async (file: File) => {
    try {
      await updateUserAvatar(file);
      forceRenderAvatar = Date.now();
      success("Succès", "Votre avatar a été mis à jour");
    } catch (e) {
      console.error(e);
      error(
        "Erreur",
        "Une erreur est survenue lors de la mise à jour de l'avatar",
      );
    }
  };

  const handleAvatarCrop = async (url: string) => {
    const file = await getFileFromUrl(url);
    await updateAvatar(file);
  };
</script>

<section class="py-2 pt-4">
  <div class="max-w-4xl">
    <Card
      class="bg-white border border-gray-200 text-gray-800 p-6 shadow-s dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
    >
      <div class="flex items-center gap-6">
        <!-- Avatar à gauche -->
        <div class="flex-shrink-0">
          <div class="relative group">
            <ImageCropper.Root onCropped={handleAvatarCrop}>
              <ImageCropper.UploadTrigger>
                <Avatar.Root
                  class="size-24 rounded-full border-4 border-gray-200 cursor-pointer transition-opacity"
                >
                  <Avatar.Image
                    src={`${getS3ObjectUrl(S3Bucket.USERS_AVATARS, authenticatedUser.id)}?${forceRenderAvatar}`}
                  />
                  <Avatar.Fallback>
                    <div
                      class="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-2xl font-bold rounded-full dark:text-gray-200"
                    >
                      {fallbackAvatarLetters(
                        authenticatedUser.firstName +
                          " " +
                          authenticatedUser.lastName,
                      )}
                    </div>
                  </Avatar.Fallback>
                </Avatar.Root>
              </ImageCropper.UploadTrigger>
              <ImageCropper.Dialog>
                <ImageCropper.Cropper cropShape="round" aspect={1} />
                <ImageCropper.Controls>
                  <ImageCropper.Cancel />
                  <ImageCropper.Crop />
                </ImageCropper.Controls>
              </ImageCropper.Dialog>
            </ImageCropper.Root>

            <div
              class={cn(
                "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-gray-200",
                {
                  "bg-green-500":
                    authenticatedUser.status === PrivateStatus.ONLINE,
                  "bg-yellow-500":
                    authenticatedUser.status === PrivateStatus.AWAY,
                  "bg-red-500":
                    authenticatedUser.status === PrivateStatus.DO_NOT_DISTURB,
                  "bg-gray-500":
                    authenticatedUser.status === PrivateStatus.OFFLINE ||
                    authenticatedUser.status === PrivateStatus.INVISIBLE,
                },
              )}
            ></div>
          </div>
        </div>

        <!-- Informations à droite -->
        <div class="flex-1 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-medium text-gray-500 uppercase">
                prénom nom
              </div>
              <div>
                {authenticatedUser.firstName}
                {authenticatedUser.lastName}
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-medium text-gray-500 uppercase">
                E-MAIL
              </div>
              <div class="flex items-center gap-2">
                <span>{authenticatedUser.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</section>
