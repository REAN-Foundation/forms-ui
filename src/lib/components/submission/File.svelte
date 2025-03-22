<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable() } = $props();
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title" class="">{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="text-red-600 ml-1">*</span>
			{/if}
		</Label>

		<Label for="score" class="float-right">{q.Score || ''}</Label>

		{#if q.Description}
			<Label for="title" class="ml-4 text-slate-700">{q.Description}</Label>
		{/if}
		<Input type="file" class=" w-full" name={q.id} bind:value={answers[q.id]} {...(q.IsRequired ? { required: true } : {})}/>
		{#if q.Hint}
			<div class="flex justify-end">
				<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">Hint: {q.Hint}</Label>
			</div>
		{/if}
	</div>
<!-- {/if} -->
