<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from "$lib/components/ui/popover";

  export let color: string;
  export let onChange: (color: string) => void;

  const presetColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
  ];
</script>

<Popover>
  <PopoverTrigger asChild>
    <button class="h-8 w-8 rounded-md border" style="background-color: {color}" />
  </PopoverTrigger>
  <PopoverContent class="w-64">
    <div class="grid grid-cols-5 gap-2">
      {#each presetColors as presetColor}
        <button
          class="h-6 w-6 rounded-md border"
          style="background-color: {presetColor}"
          on:click={() => onChange(presetColor)}
        />
      {/each}
    </div>
  </PopoverContent>
</Popover>