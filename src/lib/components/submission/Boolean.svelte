<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';

	let { q, answers = $bindable(), errors = $bindable() } = $props();
	let optionsArray: string[] = $state([]);
	$inspect('Selected answers:', answers);
	// Extract options from `q.Options`
	if (q.Options && q.Options.length > 0) {
		optionsArray = q.Options.map((option) => option.Text); // Populate with 'Text' field
	} else {
		console.error('No options available');
		optionsArray = [];
	}

	// Initialize selected value from the `answers` object
	let selected: string = $state(answers[q.id] || '');

	// Handle radio button change
	function handleRadioChange(event: Event) {
		const value = (event.target as HTMLInputElement).value; // Get selected value
		selected = value; // Update local `selected` state
		answers[q.id] = value; // Update the `answers` object dynamically
	}

	// Debugging logs (optional, for development)
	$inspect('Selected:', selected);
	console.log('Answers for this question:', answers[q.id]);
</script>

<!-- Render the Question with Radio Button Options -->
<div class="flex w-full flex-col gap-1.5 p-4">
	<Label for={q.Title}
		>{q.Title || 'Select:'}
		{#if q.IsRequired}
			<span class="ml-1 text-red-600">*</span>
		{/if}
	</Label>

	<Label for="score" class="float-right">{q.Score || ''}</Label>
	<Label for="description" class="text-xs text-gray-500">{q.Description || ''}</Label>

	{#if optionsArray.length > 0}
		{#each optionsArray as o}
			<div class="bg-slate">
				<input
					type="radio"
					onchange={handleRadioChange}
					class="input"
					name={q.id}
					value={o}
					id={o}
					checked={selected === o}
					{...q.IsRequired ? { required: true } : {}}
				/>
				<Label for={o}>{o}</Label><br />
			</div>
		{/each}
	{:else}
		<p>No options are available for this question.</p>
	{/if}

	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	<div class="flex justify-end">
		<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">
			{q.Hint || ''}
		</Label>
	</div>
</div>
