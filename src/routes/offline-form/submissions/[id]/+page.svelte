<script lang="ts">
	import { page } from '$app/state';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';
	import { onMount } from 'svelte';
	const id = page.params.id;

	console.log(id);
	let decryptedId = $state();
	const tokens = id.split('-');
	if (tokens.length < 3) {
		throw new Error('Invalid ID format');
	}
	const code = tokens[1];
	const encodedTemplateId = tokens[2];
	const templateId = atob(encodedTemplateId);

	let storage = new IndexedDbStorageManager('templates', 'template_list');
	let template = $state();

	onMount(() => {
		getTemplates(templateId);
	});

	async function getTemplates(templateId) {
		template = await storage.get(templateId);
	}

	$inspect(template, 'These are the template details');
	$inspect(code, 'Offline code');
</script>

<h1>prashant kharade</h1>
