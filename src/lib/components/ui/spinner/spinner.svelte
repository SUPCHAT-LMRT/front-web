<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { WithElementRef } from 'bits-ui';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  export const spinnerVariants = tv({
    base: 'flex-col items-center justify-center',
    variants: {
      show: {
        true: 'flex',
        false: 'hidden'
      }
    },
    defaultVariants: {
      show: true
    }
  });

  const loaderVariants = tv({
    base: 'animate-spin text-primary',
    variants: {
      size: {
        small: 'size-6',
        medium: 'size-8',
        large: 'size-12'
      }
    },
    defaultVariants: {
      size: 'medium'
    }
  });

  export type SpinnerShow = VariantProps<typeof spinnerVariants>['show'];
  export type LoaderSize = VariantProps<typeof loaderVariants>['size'];

  export type SpinnerProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      show?: SpinnerShow;
    };

  export type LoaderProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      size?: LoaderSize;
    };

  export type Props = SpinnerProps & LoaderProps & { children?: Snippet };
</script>

<script lang="ts">
  import { cn } from '$lib/utils';
  import { Loader2 } from 'lucide-svelte';

  let { class: className, show = true, size = 'medium', children }: Props = $props();
</script>

<span class={cn(spinnerVariants({ show }), className)}>
  <Loader2 class={cn(loaderVariants({ size }), className)} />
  {@render children?.()}
</span>
