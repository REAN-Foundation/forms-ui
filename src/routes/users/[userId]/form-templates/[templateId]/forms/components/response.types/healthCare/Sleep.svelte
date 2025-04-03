<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500 hover:bg-[#f9fafb] hover:dark:bg-[#262626]"
	onclick={() => {
		openSheet(card);
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter Sleep time'}
		</h1>
	</div>
	<!-- <Input
		disabled
		type="text"
		placeholder="Enter the Sleep time in hours here..."
		class="w-full p-2"
	/> -->

	<div class="w-full rounded-md border bg-slate-50 py-2 pl-2 pr-10 text-left text-slate-400">
		<p class="text-sm">Sleep time (in hours)</p>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
