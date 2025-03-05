<script lang="ts">

	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { getQuestionById } from '../../apiFunctions';
	
	////////////////////////////////////////////////////////////////
	let { close, submit, open, responseType, id, card } = $props();

	// // const dispatch = createEventDispatcher();

	// // export let responseType: string;
	// // export let id: string;
	// // export let card;

	// async function openSheetFunction() {
	// 	// console.log(id, 'this is id');
	// 	const card = await getQuestionById(id);
	// 	// dispatch('openSheet', { responseType: responseType, id: id, card: card });
	// 	open({ responseType: responseType, id: id, card: card });
	// }

	// function closeSheetFunction() {
	// 	console.log('this is from text component');
	// 	// dispatch('closeSheet');
	// 	close();
	// }

	// function handleSubmitFunction(event: any) {
	// 	// dispatch('handleSubmitForm', event);
	// 	submit(event);
	// }
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={async () => {
		const questionCard = await getQuestionById(id);
		open({ responseType: responseType, id: id, card: questionCard });
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">{card.Title || 'Enter question here'}</h1>
		<!-- <p>{responseType}</p> -->
	</div>
	<div class="h-fit w-full rounded">
		<div class="flex items-start justify-start py-2 pl-2 font-serif text-sm text-slate-500">
			<Icon icon="fluent:text-12-regular" width="15" height="15" />
			<p class="ml-1">Text</p>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
