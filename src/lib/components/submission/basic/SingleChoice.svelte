<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
	let optionsArray = $state();

	// Extract options from `q.Options`
	if (q.Options && q.Options.length > 0) {
		optionsArray = q.Options.map((option) => option.Text); // Use 'Text' from each card object
	}

	// Initialize selected value directly from the answers object
	let selected = $state(answers[q.id] || '');

	// Handle radio button change
	function handleRadioChange(event) {
		const value = event.target.value;
		selected = value; // Update local state
		answers[q.id] = value; // Synchronize with answers object
	}
</script>

<!-- Render the Question with Radio Options -->
<div class="w-full space-y-3 rounded-lg px-4 py-4">
	<div class="flex items-center justify-between">
		<Label for={q.Title}>
			{q.Title || 'Select :'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		<Label for="score" class="text-sm font-medium">{q.Score || ''}</Label>
	</div>
	<Label for="title" class="text-xs text-gray-500">{q.Description || ''}</Label>

	{#each optionsArray as o}
		<div class=" flex items-center space-x-3">
			<input
				type="radio"
				class="input"
				name={q.id}
				id={o}
				value={o}
				onchange={handleRadioChange}
				bind:group={selected}
				checked={answers[q.id] === o}
				{...q.IsRequired ? { required: true } : {}}
				disabled={isSubmitted}
			/>
			<Label for={o}>{o}</Label><br />
		</div>
	{/each}

	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	<div class="flex justify-end">

		<Label for="hint" class="my-1 text-xs text-gray-400">
			{q.Hint || ''}
		</Label>
	</div>
</div>

<!-- {/if} -->
<!-- <div class="mt-4 w-full justify-between rounded-md border border-slate-300 bg-slate-200 p-4">
	<div>
		<label for="title" class="text-lg font-semibold text-slate-950">{q.Title}</label>
		{#if q.Score}
			<label for="score" class="float-right">{q.Score}</label>
		{/if}
		<br />
		{#if q.Description}
			<label for="title" class="ml-4 text-slate-700">{q.Description}</label><br />
		{/if}

		{#each optionsArray as o}
			<div>
				<input
					type="radio"
					onchange={handleRadioChange}
					class="input"
					name={q.id}
					bind:group={selected}
					value={o}
					id={o}
				/>
				<label for={o}>{o}</label><br />
			</div>
		{/each}

		{#if q.Hint}
			<div class="flex justify-end">
				<label for="hint" class="float-right ml-auto mt-4 justify-end bg-slate-300 p-2">
					Hint: {q.Hint}
				</label>
			</div>
		{/if}
	</div>
</div> -->
