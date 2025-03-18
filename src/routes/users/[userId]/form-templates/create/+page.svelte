<script lang="ts">
	import AssessmentForm from '$lib/components/template/AssessmentForm.svelte';
	import type { PageServerData } from './$types';

	let data: PageServerData = $props();
	const formDataForForm = data.data;
	console.log(data.data, 'This is data from section form editor');
</script>

<AssessmentForm {formDataForForm} />
