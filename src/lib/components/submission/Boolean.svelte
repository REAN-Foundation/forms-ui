<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	export let q;
	export let answers;
	let optionsArray: any;

	// Ensure q.Options is defined, is an array, and contains at least one non-empty string
	// if (Array.isArray(q.Options) && q.Options.length > 0) {
	// Check that the first element of q.Options is a string and split it if so
	// if (typeof q.Options[0] === 'string' && q.Options[0].trim() !== '') {
	if (q.Options && q.Options.length > 0) {
		// optionsArray = q.Options[0].split(',').map((option) => option.trim());
		optionsArray = q.Options.map((option) => option.Text);
	}
	// }

	let selected = '';

	function handleRadioChange(event) {
		const value = event.target.value;
		selected = value;
		answers[q.id] = value;
	}
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for={q.Title}>{q.Title || 'Select :'}</Label>

		<Label for="score" class="float-right">{q.Score || ''}</Label>

		<Label for="description" class="ml-4">{q.Description || ''}</Label>

		{#if optionsArray.length > 0}
			{#each optionsArray as o}
				<div class="bg-slate">
					<input
						type="radio"
						onchange={handleRadioChange}
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

		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">{q.Hint || ''}</Label>
		</div>
	</div>
<!-- {/if} -->
