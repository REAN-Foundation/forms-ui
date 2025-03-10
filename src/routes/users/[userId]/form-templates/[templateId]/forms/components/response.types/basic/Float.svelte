<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { getQuestionById } from '../../apiFunctions';

	////////////////////////////////////////////////////////////////
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	////////////////////////////////////////////////////////////////

	let { card, openSheet } = $props();

	const templateId = $derived(page.params.templateId);
	const userId = $derived(page.params.userId);

	console.log(card, 'This is card from float file');
	function questionEditRoute(card) {
		// goto(`/users/${userId}/form-templates/${templateId}/forms/${id}/question-edit`);
		// console.log(card);
	}
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={()=>{openSheet(card)}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">{card.Title || 'Enter question here'}</h1>
	</div>
	<div class="h-fit w-full rounded p-2">
		<div class="flex items-start justify-start py-2 font-serif text-sm text-slate-500">
			<Icon icon="mdi:decimal" width="20" height="20" />
			<p class="ml-1">Float</p>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
