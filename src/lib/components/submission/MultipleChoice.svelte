<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	let { q, answers = $bindable(), errors = $bindable()} = $props();
	let optionsArray: any = $state();

	// Ensure q.Options is defined, is an array, and contains at least one non-empty string
	// if (Array.isArray(q.Options) && q.Options.length > 0 && typeof q.Options[0] === 'string') {
	// 	console.log('this is array');
	// 	optionsArray = q.Options[0].split(',').map((option) => option.trim());
	if (q.Options && q.Options.length > 0) {
		optionsArray = q.Options.map((option) => option.Text);
	} else {
		console.log('this is empty array');
		optionsArray = [];
	}

	let selected: string[] = $state([]);

	function handleCheckboxChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		if (target.checked) {
			selected = [...selected, value];
			answers[target.name] = selected;
		} else {
			selected = selected.filter((item) => item !== value);
			answers[target.name] = selected;
		}
	}
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title" class="">{q.Title || 'Select :'}
			{#if q.IsRequired}
				<span class="text-red-600 ml-1">*</span>
			{/if}
		</Label>

		<Label for="score" class="float-right">{q.Score || ''}</Label>

		<Label for="title" class="text-xs text-gray-500">{q.Description || ''}</Label>

		{#if optionsArray.length > 0}
			{#each optionsArray as o}
				<div>
					<input
						type="checkbox"
						onchange={handleCheckboxChange}
						class="input"
						name={q.id}
						bind:group={selected}
						value={o}
						id={o}
					/>
					<Label for={o}>{o}</Label><br />
				</div>
			{/each}
		{:else}
			<p>No options are available for this question.</p>
		{/if}
		{#if errors[q.id]}
			<p class="text-red-600 text-xs mt-1">{errors[q.id]}</p>
		{/if}
		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">{q.Hint || ''}</Label>
		</div>
	</div>
<!-- {/if} -->
