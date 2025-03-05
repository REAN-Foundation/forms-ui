<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	export let q;
	export let answers;
</script>

{#if q.ResponseType === 'DateTime'}
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title" class="">{q.Title || 'No title provided'}</Label>

		{#if q.score}
			<Label for="score" class="float-right">{q.Score}</Label>
		{/if}

		{#if q.Description}
			<Label for="title" class="ml-4 text-slate-700">{q.Description}</Label>
		{/if}
		<Input type="datetime-local" class="w-full" name={q.id} bind:value={answers[q.id]} />
		{#if q.Hint}
			<div class="flex justify-end">
				<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2"
					>Hint: {q.Hint || ''}</Label
				>
			</div>
		{/if}
	</div>
{:else if q.ResponseType === 'Date'}
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title" class="">{q.Title || 'No title provided'}</Label>

		{#if q.score}
			<Label for="score" class="float-right">{q.Score}</Label>
		{/if}

		{#if q.Description}
			<Label for="title" class="ml-4 text-slate-700">{q.Description}</Label>
		{/if}
		<Input type="date" class="w-full" name={q.id} bind:value={answers[q.id]} />
		{#if q.Hint}
			<div class="flex justify-end">
				<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2"
					>Hint: {q.Hint || ''}</Label
				>
			</div>
		{/if}
	</div>
{/if}
