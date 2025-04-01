<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	///////////////////////////////////////////////////////////////////////////

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
</script>

<div class="flex w-full flex-col px-4 py-2">
	<div class="flex justify-between">
		<Label for={q.Title}
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		{#if q.Score}
			<Label for="score">{q.Score}</Label>
		{/if}
	</div>

	{#if q.Description}
		<Label class="text-xs text-gray-500">{q.Description}</Label>
	{/if}

	<Input name={q.id} bind:value={answers[q.id]} type="text" class="mt-2" disabled={isSubmitted} />

	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	{#if q.Hint}
		<Label class="self-end text-xs text-gray-400">Hint: {q.Hint}</Label>
	{/if}
</div>
