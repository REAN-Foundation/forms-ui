<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
	function handleInput(event, id) {
		const value = event.target.value;
		if (value.length > 20) {
			answers[id] = value.slice(0, 20); // Enforce maxlength
		} else {
			answers[id] = value; // Update as-is if within limits
		}
	}
</script>

<!-- {#if q.Title} -->
<div class="space-y-2 rounded-lg px-4 pt-4">
	<div class="flex justify-between">
		<Label for={q.Title} class="text-sm"
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		{#if q.score}
			<Label for="score" class="text-sm font-medium">{q.Score}</Label>
		{/if}
	</div>

	{#if q.Description}
		<Label for="title" class="text-xs text-gray-500">{q.Description}</Label><br />
	{/if}
	<Input
		type="number"
		step="any"
		class="w-full"
		bind:value={answers[q.id]}
		name={q.id}
		disabled={isSubmitted}
	/>
	<!-- oninput={(e) => handleInput(e, q.id)} -->
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}
	{#if q.Hint}
		<p class=" text-end text-xs text-gray-400">{q.Hint}</p>
	{/if}
</div>
<!-- {/if} -->
