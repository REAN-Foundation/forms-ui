<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(),errors = $bindable(),isSubmitted} = $props();
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<div class="flex flex-row justify-between items-center">
			<Label for="title">{q.Title || 'No title provided'}
				{#if q.IsRequired}
					<span class="text-red-600 ml-1">*</span>
				{/if}
			</Label>
			<Label for="score">{q.Score || ''}</Label>
		</div>

		<Label for="title" class="ml-2">{q.Description || 'No description provided'}</Label>

		<Input type="text" class=" w-full" name={q.id} bind:value={answers[q.id]} disabled={isSubmitted} />
		{#if errors[q.id]}
			<p class="text-red-600 text-xs mt-1">{errors[q.id]}</p>
		{/if}

		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">{q.Hint || ''}</Label>
		</div>
	</div>
<!-- {/if} -->
