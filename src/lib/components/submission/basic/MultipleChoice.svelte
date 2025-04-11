<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';

	let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();

	let selectedOptions = $state([]);

	$effect(() => {
		if (answers[q.id]) {
			selectedOptions = JSON.parse(answers[q.id]);
		}
	});

	let optionsArray: string[] = $state(q.Options?.map((option) => option.Text.trim()) || []);

	function handleCheckboxChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		if (target.checked) {
			selectedOptions = [...selectedOptions, value];
			answers[q.id] = JSON.stringify(selectedOptions);
		} else {
			selectedOptions = selectedOptions.filter((item) => item !== value);
			answers[q.id] = JSON.stringify(selectedOptions);
		}
	}
</script>

<!-- Render Question with Checkbox Options -->
<div class=" space-y-2 rounded-lg px-4 pt-4">
	<div class="flex  justify-between">
		<Label for="title" class="text-sm">
			{q.Title || 'Select:'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		<Label for="score" class="text-sm font-medium">{q.Score || ''}</Label>
	</div>
	<Label for="description" class="text-xs text-gray-500">{q.Description || ''}</Label>
	<Input type="text" class="hidden w-full" bind:value={answers[q.id]} />
	{#if optionsArray.length > 0}
		{#each optionsArray as o}
			<div class="flex items-center space-x-3">
				<!-- Ensure checked state based on answers -->
				<input
					type="checkbox"
					class="input"
					name={q.id}
					value={o}
					id={o}
					checked={selectedOptions.includes(o)}
					onchange={handleCheckboxChange}
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

	<p class=" text-end text-xs text-gray-400">{q.Hint || ''}</p>
</div>
