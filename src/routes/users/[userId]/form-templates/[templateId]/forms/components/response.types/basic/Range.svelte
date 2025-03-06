<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getQuestionById } from '../../apiFunctions';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	////////////////////////////////////////////////////////////////
	
	let { close, submit, open, responseType, id, card } = $props();
	const templateId = $derived(page.params.templateId);
	const userId = $derived(page.params.userId);

	function questionEditRoute(id) {
		goto(`/users/${userId}/form-templates/${templateId}/forms/${id}/question-edit`);
	}
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={async () => questionEditRoute(id)}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">{card.Title || 'Define a range'}</h1>
	</div>
	<div class="h-fit w-full rounded">
		<div class="flex items-start justify-start py-2 pl-2 font-serif text-sm text-slate-500">
			<Input type="range" id="option1" name="options" disabled />
		</div>
	</div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
