<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	import { StorageManager } from '$lib/utils/storage';
	import { onMount } from 'svelte';

	const storage = new StorageManager('indexedDB', 'TemplateDb', 'TemplateStore');
	
	onMount(async () => {
		for (const template of data.templates) {
			await storage.set(template.id, template);
			console.log(template.id,"data from layout");
		}

		console.log('✅ Templates saved to IndexedDB');
	});
</script>

<div class="bg-yello flex h-screen flex-col">
	<div class="fixed top-0 z-50 w-full bg-emerald-500">
		<!-- <Navbar /> -->
	</div>
	<div class="bg-sl h-full">
		{@render children()}
	</div>
</div>
