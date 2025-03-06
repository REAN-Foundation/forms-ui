<script lang="ts">
	import SectionEditor from '$lib/components/forms/SectionEditor.svelte';
	import type { PageData, PageServerData } from './$types';
	import type { PageServerLoad, Actions } from './$types.js';
	import { fail } from '@sveltejs/kit';

	let data: PageServerData = $props();
	const formDataForForm = data.data;
	console.log(data.data, 'This is data from section form editor');
</script>

<SectionEditor {formDataForForm} />
