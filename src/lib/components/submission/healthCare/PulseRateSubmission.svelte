<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
</script>

<div class=" space-y-2 rounded-lg px-4 pt-4">
	<div class="flex items-center justify-between">
		<Label for={q.Title} class="text-sm"
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		{#if q.score}
			<Label for="score" class=" text-sm font-medium">{q.Score}</Label>
		{/if}
	</div>
	{#if q.Description}
		<Label for="title" class="text-xs text-gray-500">{q.Description}</Label><br />
	{/if}
	<div class="flex items-center space-x-2">
		<Input
			type="number"
			class=" !w-[94%]"
			bind:value={answers[q.id]}
			name={q.id}
			disabled={isSubmitted}
		/><Label>bpm</Label>
	</div>

	<!-- oninput={(e) => handleInput(e, q.id)} -->
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}
	{#if q.Hint}
		<div class="flex justify-end">
			<Label for="hint" class="text-end text-xs text-gray-400">Hint: {q.Hint}</Label>
		</div>
	{/if}
</div>
