<script lang="ts">
    import { page } from '$app/state';
    import {Toaster} from "$lib/components/ui/sonner";
    import Error from "$lib/components/app/icon/Error.svelte";
    import Validate from "$lib/components/app/icon/Validate.svelte";

    let { children } = $props();

    let currentPath = $state('translate-register');

    $effect(() => {
        currentPath = page.url.pathname === '/login' ? 'translate-login' : 'translate-register';
    });
</script>

<div class="flex min-h-screen">
    <div class={`bg-left w-1/2 ${currentPath}`}></div>
    <div class="w-1/2 bg-white z-2 relative">
        {#if children}
            {@render children?.()}
        {/if}
    </div>
</div>

<style lang="postcss">
    .bg-left {
        @apply relative;
        transition: transform 1s ease;

        &:before {
            @apply absolute inset-0;
            content: "";
            background-image:
                    radial-gradient(circle at 20% 35%, #96C9DC 5%, #61a0af 10%, transparent 20%, transparent 100%),
                    radial-gradient(circle at 75% 10%, #96C9DC 0%, #61a0af 10%, transparent 20%, transparent 100%),
                    radial-gradient(circle at 35% 95%, #96C9DC 5%, #24586B 10%, transparent 20%, transparent 100%),
                    radial-gradient(circle at 100% 70%, #96C9DC 5%, #b3d8e6 10%, transparent 20%, transparent 100%),
                    linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
            background-size: cover;
            background-position: center;
            filter: blur(50px);
            transition: transform 1s ease;
            transform-origin: center;
            z-index: 1;
        }
    }

    .translate-login:before {
        transform: rotate(0deg);
    }

    .translate-register:before {
        transform: rotate(180deg);
    }
</style>



<Toaster>
    <Validate slot="success-icon" />
    <Error slot="error-icon" />
</Toaster>