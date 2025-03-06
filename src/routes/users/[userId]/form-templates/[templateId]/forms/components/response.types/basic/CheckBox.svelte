<script lang="ts">
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
	let optionsArray = $state([]);

	if (card.Options && Array.isArray(card.Options) && card.Options.length > 0) {
		optionsArray = card.Options.map((option) => option.Text);
	} else {
		optionsArray = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
	}

	// async function openSheetFunction() {
	// 	const fetchedCard = await getQuestionById(id);
	// 	dispatch('openSheet', { responseType, id, card: fetchedCard });
	// }
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={async () => questionEditRoute(id)}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter multiple choice question'}
		</h1>
	</div>
	<div class=" h-fit w-full rounded p-1">
		{#each optionsArray as option, index}
			<div class="flex items-center">
				<input type="checkbox" id={`option${index}`} name="options" disabled />
				<label for={`option${index}`} class="ml-2 font-serif text-sm text-slate-500">{option}</label
				>
			</div>
		{/each}
	</div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
