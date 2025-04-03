<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
</script>

<!-- {#if q.Title} -->
<div class="w-full space-y-3 rounded-lg px-4 py-4">
	<div class="flex items-center justify-between">
		<Label for="title" class=""
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		{#if q.Score}
			<Label for="score" class="float-right">{q.Score}</Label>
		{/if}
	</div>

	{#if q.Description}
		<Label for="title" class="text-xs text-gray-500">{q.Description}</Label>
	{/if}

	<Input
		type="number"
		class="w-full "
		name={q.id}
		min={q?.RangeMin}
		max={q?.RangeMax}
		bind:value={answers[q.id]}
		disabled={isSubmitted}
	/>
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	<div class="flex justify-end">

	{#if q.Hint}
		<Label for="hint" class="my-1 text-xs text-gray-400">{q.Hint}</Label>
	{/if}
	</div>
</div>
<!-- {/if} -->
