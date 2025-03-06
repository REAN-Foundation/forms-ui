<script lang="ts">
	import FieldEditor from '$lib/components/forms/FieldEditor.svelte';
	import type { PageServerData } from './$types';


	let data: PageServerData = $props();
	const formDataForForm = data.data;
	console.log(data.data, 'This is data from section form editor');
</script>

<FieldEditor {formDataForForm} />
