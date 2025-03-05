<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { getQuestionById } from '../../apiFunctions';

	//////////////////////////////////////////////////////////////////////////////

	let { close, submit, open, responseType, id, card } = $props();

	let optionsArray = $state([]);

	if (card?.Options && Array.isArray(card.Options)) {
		optionsArray = card.Options.map((option) => option.Text);
	} else {
		optionsArray = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
	}

	// async function openSheetFunction() {
	// 	// console.log(id, 'this is id');
	// 	const card = await getQuestionById(id);
	// 	dispatch('openSheet', { responseType: responseType, id: id, card: card });
	// }
</script>

<Button
	class="flex h-fit w-full flex-col space-y-4 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={async () => {
		const questionCard = await getQuestionById(id);
		open({ responseType: responseType, id: id, card: questionCard });
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">{card?.Title || 'Enter question here'}</h1>
	</div>
	<div class="flex h-fit w-full flex-col rounded p-1">
		{#if card?.Options && card.Options.length > 0}
			{#each optionsArray as option, index}
				<div class="flex items-start justify-start font-serif text-sm text-slate-500">
					<Icon icon="eva:radio-button-off-outline" width="15" height="15" />
					<label for="" class="ml-1 font-serif text-sm text-slate-500">{option}</label>
				</div>
			{/each}
		{:else}
			{#each ['Option 1', 'Option 2'] as option, index}
				<div class="flex items-start justify-start font-serif text-sm text-slate-500">
					<Icon icon="eva:radio-button-off-outline" width="15" height="15" />
					<label for="" class="ml-1 font-serif text-sm text-slate-500">{option}</label>
				</div>
			{/each}
		{/if}
	</div>
	<div>
		<p class="text-sm text-slate-400">{card?.Description || ''}</p>
	</div>
</Button>
