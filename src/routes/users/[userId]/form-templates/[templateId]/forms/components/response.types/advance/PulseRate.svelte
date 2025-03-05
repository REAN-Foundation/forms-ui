<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { getQuestionById } from '../../apiFunctions';

	////////////////////////////////////////////////////////////////
	let { close, submit, open, responseType, id, card } = $props();
</script>

<Button
	class="flex h-fit w-full flex-col space-y-4 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={async () => {
		const questionCard = await getQuestionById(id);
		open({ responseType: responseType, id: id, card: questionCard });
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between py-1">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter Heart rate'}
		</h1>
	</div>
	<Input type="text" disabled placeholder="Enter the Heart Rate here..." class="w-full  p-2" />

	<div
		class="flex w-full flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
	>
		<p>Normally : 60-100 bpm</p>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
