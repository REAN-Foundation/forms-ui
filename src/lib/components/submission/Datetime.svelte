<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	let { q, answers = $bindable(), errors = $bindable() } = $props();

	function formatDate(value: string, type: 'date' | 'datetime-local') {
		if (!value) return '';
		const date = new Date(value);

		if (isNaN(date.getTime())) {
			console.error('Invalid date:', value);
			return '';
		}

		return type === 'date'
			? date.toISOString().split('T')[0]
			: date.toISOString().slice(0, 16);
	}

	// Format on load
	if ((q.ResponseType === 'Date' || q.ResponseType === 'DateTime') && answers[q.id]) {
		const type = q.ResponseType === 'Date' ? 'date' : 'datetime-local';
		answers[q.id] = formatDate(answers[q.id], type);
	}
	
</script>

{#if q.ResponseType === 'DateTime'}
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title"
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		{#if q.Score}
			<Label for="score" class="float-right">{q.Score}</Label>
		{/if}

		{#if q.Description}
			<Label for="title" class="ml-4 text-slate-700">{q.Description}</Label>
		{/if}

		<!-- DateTime Input with formatted value -->
		<Input
			type="datetime-local"
			class="w-full"
			name={q.id}
			bind:value={answers[q.id]}
		/>

		{#if errors[q.id]}
			<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
		{/if}

		{#if q.Hint}
			<div class="flex justify-end">
				<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">Hint: {q.Hint}</Label>
			</div>
		{/if}
	</div>
{:else if q.ResponseType === 'Date'}
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title">{q.Title || 'No title provided'}</Label>

		{#if q.Score}
			<Label for="score" class="float-right">{q.Score}</Label>
		{/if}

		{#if q.Description}
			<Label for="title" class="ml-4 text-slate-700">{q.Description}</Label>
		{/if}

		<!-- Date Input with formatted value -->
		<Input
			type="date"
			class="w-full"
			name={q.id}
			bind:value={answers[q.id]}
		/>

		{#if errors[q.id]}
			<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
		{/if}

		{#if q.Hint}
			<div class="flex justify-end">
				<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">Hint: {q.Hint}</Label>
			</div>
		{/if}
	</div>
{/if}
