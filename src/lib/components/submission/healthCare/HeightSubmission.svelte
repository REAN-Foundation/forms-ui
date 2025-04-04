<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();

	$inspect('This is answers', answers[q.id]);
</script>

<div class="flex w-full flex-col gap-1.5 p-4">
	<Label for={q.Title}
		>{q.Title || 'No title provided'}
		{#if q.IsRequired}
			<span class="ml-1 text-red-600">*</span>
		{/if}
	</Label>

	{#if q.score}
		<Label for="score" class="float-right">{q.Score}</Label>
	{/if}

	{#if q.Description}
		<Label for="title" class="text-xs text-gray-500">{q.Description}</Label><br />
	{/if}
	<div class="flex items-center space-x-2">
		<Input
			type="number"
			class="w-full"
			bind:value={answers[q.id]}
			name={q.id}
			disabled={isSubmitted}
		/><Label>cm</Label>
	</div>

	<!-- oninput={(e) => handleInput(e, q.id)} -->
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}
	{#if q.Hint}
		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">Hint: {q.Hint}</Label>
		</div>
	{/if}
</div>
