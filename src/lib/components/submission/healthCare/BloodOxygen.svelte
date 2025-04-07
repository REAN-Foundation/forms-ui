<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
</script>

<!-- {#if q.Title} -->
<div class="flex w-full flex-col gap-1.5 p-4">
	<Label for="title"
		>{q.Title || 'No title provided'}
		{#if q.IsRequired}
			<span class="ml-1 text-red-600">*</span>
		{/if}
	</Label>

	<!-- <Label>Drop file here{q.ResponseType}</Label> -->

	<Label for="score" class=" text-sm font-medium">{q.Score || ''}</Label>

	<Label for="title" class="text-xs text-gray-500">{q.Description || ''}</Label
	>

	<Input
		type="text"
		class=" !w-[94%]"
		name={q.id}
		bind:value={answers[q.id]}
		disabled={isSubmitted}
	/>
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	<p class="text-end text-xs text-gray-400">{q.Hint || ''}</p>
</div>
<!-- {/if} -->
