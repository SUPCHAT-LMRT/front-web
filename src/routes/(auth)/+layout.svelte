<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar";
	import AppSidebar from "$lib/app-sidebar.svelte";

	let { children } = $props();
</script>

<div class="app">
	<Sidebar.Provider >
		<AppSidebar />
		<main>
			{@render children?.()}
		</main>
	</Sidebar.Provider>
</div>