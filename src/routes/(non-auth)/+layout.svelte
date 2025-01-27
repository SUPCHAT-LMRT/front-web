<script lang="ts">
    let { children } = $props();
</script>
<div class="flex min-h-screen">
    <div class="bg-left w-1/2"></div>
    <div class="w-1/2">
        {@render children?.()}
    </div>
</div>

<style lang="postcss">
    .bg-left {
        @apply relative;

        &:before {
            @apply absolute inset-0;
            content: "";
            background-image: radial-gradient(circle at 20% 35%, #96C9DC 5%, #61a0af 10%, transparent 20%, transparent 100%),
            radial-gradient(circle at 75% 10%, #96C9DC 0%, #61a0af 10%, transparent 20%, transparent 100%),
            radial-gradient(circle at 35% 95%, #96C9DC 5%, #24586B 10%, transparent 20%, transparent 100%),
            radial-gradient(circle at 100% 70%, #96C9DC 5%, #b3d8e6 10%, transparent 20%, transparent 100%);
            background-size: cover;
            background-position: center;
            filter: blur(50px);
        }
    }
</style>