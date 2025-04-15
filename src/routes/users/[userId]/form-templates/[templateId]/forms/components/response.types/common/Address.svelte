<script lang="ts">
	import Icon from '@iconify/svelte';
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
			{card.Title || 'Enter Phone number here'}
			{#if card.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</h1>
	</div>
	<div class="h-fit w-full rounded">
		<div
			class="flex flex-col items-start justify-start p-2 gap-2 font-serif text-sm text-slate-500"
		>
			<div
				class="w-full rounded-md border border-slate-200 p-2 flex-row flex  text-left text-slate-400 dark:border-slate-800"
			>
				<Icon icon="ic:outline-home" width="20" height="20" />
				<p class="text-sm pl-2">House No / Flat No</p>
			</div>
			<div
				class="w-full rounded-md border border-slate-200 p-2 flex-row flex text-left text-slate-400 dark:border-slate-800"
			>
				<Icon icon="arcticons:streetcomplete" width="20" height="20" />
				<p class="text-sm pl-2">Street</p>
			</div>
			<div
				class="w-full rounded-md border border-slate-200 p-2 flex-row flex text-left text-slate-400 dark:border-slate-800"
			>
				<Icon icon="entypo:address" width="20" height="20" />
				<p class="text-sm pl-2">Town</p>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
