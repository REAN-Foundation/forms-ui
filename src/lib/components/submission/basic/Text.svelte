<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	///////////////////////////////////////////////////////////////////////////

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
	console.log('Question is ', q);
	console.log('Answers is ', answers);
</script>

<div class="flex w-full flex-col gap-1.5 p-4">
	<div class="flex flex-row justify-between items-center">
		<Label for={q.Title}
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		<Label for="score">{q.Score || ''}</Label>
	</div>

	{#if q.Description}
		<Label class="ml-2">{q.Description}</Label>
	{/if}

	<Input name={q.id} bind:value={answers[q.id]} type="text" class="mt-2" disabled={isSubmitted} />

	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	{#if q.Hint}
		<Label class="self-end text-xs text-gray-400">Hint: {q.Hint}</Label>
	{/if}
</div>
