<script lang="ts">
	import SectionEditor from '$lib/components/forms/SectionEditor.svelte';
	import type { PageServerData } from './$types';

	let data: PageServerData = $props();
	const formDataForForm = data.data;
	console.log(data.data, 'This is data from section form editor');
</script>

<SectionEditor {formDataForForm} />
