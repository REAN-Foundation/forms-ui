<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
</script>

<!-- {#if q.Title} -->
<div class="space-y-2 rounded-lg px-4 pt-4">
	<div class="flex justify-between">
		<Label for="title" class=" text-sm"
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		<Label for="score" class="text-sm font-medium">{q.Score || ''}</Label>
	</div>

	{#if q.Description}
		<Label for="title" class="text-xs text-gray-500">{q.Description}</Label>
	{/if}
	<Input
		type="file"
		class=" w-full"
		name={q.id}
		bind:value={answers[q.id]}
		disabled={isSubmitted}
	/>
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}


	{#if q.Hint}
		<p  class=" text-end text-xs text-gray-400"> {q.Hint}</p>
	{/if}
</div>
<!-- {/if} -->
