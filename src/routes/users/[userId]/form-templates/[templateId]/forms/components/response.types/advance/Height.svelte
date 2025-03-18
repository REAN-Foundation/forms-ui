<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={() => {
		openSheet(card);
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between py-1">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter Height'}
		</h1>
	</div>
	<Input
		type="text"
		disabled
		placeholder="Enter the Height in cm / m /inches here..."
		class="brder w-full p-2"
	/>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
