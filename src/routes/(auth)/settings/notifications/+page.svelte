<script lang="ts">
    import { Switch } from "$lib/components/ui/switch";
    import { Label } from "$lib/components/ui/label";
    import { Mail, Smartphone } from "lucide-svelte";

    let emailNotifications = $state(true);
    let pushNotifications = $state(false);


</script>

<section class="px-4 py-2 ml-2 pt-8 w-[500px]">
    <h2 class="text-gray-700 text-lg font-semibold mb-6 dark:text-gray-200">Notifications</h2>

    <div class="space-y-6">
        <!-- Notifications par email -->
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <Mail class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                    <Label for="email-notifications" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Notifications par email
                    </Label>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recevoir les notifications importantes par email
                    </p>
                </div>
            </div>
            <Switch
                    id="email-notifications"
                    bind:checked={emailNotifications}
            />
        </div>

        <!-- Notifications push -->
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <Smartphone class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                    <Label for="push-notifications" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Notifications push
                    </Label>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recevoir les notifications directement sur votre appareil
                    </p>
                </div>
            </div>
            <Switch
                    id="push-notifications"
                    bind:checked={pushNotifications}
            />
        </div>
    </div>

    <div class="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
        <p class="text-xs text-gray-600 dark:text-gray-400">
            💡 Les modifications sont sauvegardées automatiquement. Vous pouvez modifier ces préférences à tout moment.
        </p>
    </div>
</section>