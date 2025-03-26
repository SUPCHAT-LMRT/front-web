<!--
	jsrepo 1.41.3
	Installed from github/ieedan/shadcn-svelte-extras
	04-03-2025
-->

<script lang="ts">
	import { type ButtonProps, Button } from '../button';
	import type { WithoutChildren } from 'bits-ui';
	import { useImageCropperCrop } from './image-cropper.svelte.js';
	import { Crop } from 'lucide-svelte';

	let {
		variant = 'default',
		size = 'sm',
		...rest
	}: Omit<WithoutChildren<ButtonProps>, 'onclick'> = $props();

	const cropState = useImageCropperCrop();
</script>

<Button {...rest} {size} {variant} onclick={cropState.onclick}>
	<Crop />
	<span>Crop</span>
</Button>
