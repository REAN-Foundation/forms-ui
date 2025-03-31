<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable() } = $props();
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title" class="">{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="text-red-600 ml-1">*</span>
			{/if}
		</Label>

		{#if q.Score}
			<Label for="score" class="float-right">{q.Score}</Label>
		{/if}

		{#if q.Description}
			<Label for="title" class="text-xs text-gray-500">{q.Description}</Label>
		{/if}

		<Input type="number" class="w-full " name={q.id} min={q?.RangeMin} max={q?.RangeMax} bind:value={answers[q.id]}/>
		{#if errors[q.id]}
			<p class="text-red-600 text-xs mt-1">{errors[q.id]}</p>
		{/if}
		{#if q.Hint}
			<div class="flex justify-end">
				<Label for="hint" class="float-right ml-auto mt-4 justify-end  p-2">Hint: {q.Hint}</Label>
			</div>
		{/if}
	</div>
<!-- {/if} -->
