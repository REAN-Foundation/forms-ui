<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
	let optionsArray = $state([]);
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
	function handleRadioChange(event) {
		const value = event.target.value;
		selected = value; // Update local state
		answers[q.id] = value; // Synchronize with answers object
	}

	// Debugging logs (optional, for development)
	$inspect('Selected:', selected);
	console.log('Answers for this question:', answers[q.id]);
</script>

<!-- Render the Question with Radio Button Options -->
<div class=" space-y-2 rounded-lg px-4 pt-4">
	<div class="flex justify-between">
		<Label for={q.Title} class="text-sm"
			>{q.Title || 'Select:'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		<Label for="score" class="text-sm font-medium">{q.Score || ''}</Label>
	</div>

	<Label for="description" class="text-xs text-gray-500">{q.Description || ''}</Label>

	{#if optionsArray.length > 0}
		{#each optionsArray as o}
			<div class="flex items-center space-x-3">
				<input
					type="radio"
					onchange={handleRadioChange}
					class="input"
					name={q.id}
					value={o}
					id={o}
					bind:group={selected}
					checked={answers[q.id] === o}
					disabled={isSubmitted}
				/>
				<Label for={o}>{o}</Label>
			</div>
		{/each}
	{:else}
		<p>No options are available for this question.</p>
	{/if}

	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	<p class=" text-end text-xs text-gray-400">
		{q.Hint || ''}
	</p>
</div>
