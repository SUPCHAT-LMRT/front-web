<!--
	jsrepo 1.41.3
	Installed from github/ieedan/shadcn-svelte-extras
	04-03-2025
-->

<script lang="ts">
  import { useId } from "bits-ui";
  import { onDestroy } from "svelte";
  import { box } from "svelte-toolbelt";
  import { useImageCropperRoot } from "./image-cropper.svelte.js";
  import type { ImageCropperRootProps } from "./types.js";

  let {
    id = useId(),
    src = $bindable(""),
    onCropped = () => {},
    children,
    ...rest
  }: ImageCropperRootProps = $props();

  const rootState = useImageCropperRoot({
    id: box.with(() => id),
    src: box.with(
      () => src,
      (v) => (src = v),
    ),
    onCropped,
  });

  onDestroy(() => rootState.dispose());
</script>

{@render children?.()}
<input
  {...rest}
  onchange={(e) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    rootState.onUpload(file);
    // reset so that we can reupload the same file
    (e.target! as HTMLInputElement).value = "";
  }}
  type="file"
  {id}
  style="display: none;"
/>
