<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	let { q, answers = $bindable() } = $props();
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
<div class="flex w-full flex-col gap-1.5 p-4">
	<Label for={q.Title}>{q.Title || 'No title provided'}</Label>

	{#if q.score}
		<Label for="score" class="float-right">{q.Score}</Label>
	{/if}

	{#if q.Description}
		<Label for="title" class="ml-4 ">{q.Description}</Label><br />
	{/if}
	<Input
		type="number"
		class="w-full"
		bind:value={answers[q.id]}
		name={q.id}
		/>
		<!-- oninput={(e) => handleInput(e, q.id)} -->
	{#if q.Hint}
		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">Hint: {q.Hint}</Label>
		</div>
	{/if}
</div>
<!-- {/if} -->
