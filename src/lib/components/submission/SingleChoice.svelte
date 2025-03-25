<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	let { q, answers = $bindable(), errors = $bindable()} = $props();
	let optionsArray: any = $state();

	// Ensure q.Options is defined and is an array with at least one element
	// if (q.Options && q.Options.length > 0 && typeof q.Options[0] === 'string') {
	if (q.Options && q.Options.length > 0) {
		// optionsArray = q.Options[0].split(',').map((option) => option.trim());
		optionsArray = q.Options.map((option) => option.Text); // Use 'Text' from each card object
	}

	console.log(q, 'this is question', q.Options, typeof q.Options);
	let selected = $state();

	function handleRadioChange(event) {
		const value = event.target.value;
		selected = value;
		answers[q.id] = value;
	}
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for={q.Title}>{q.Title || 'Select :'}
			{#if q.IsRequired}
				<span class="text-red-600 ml-1">*</span>
			{/if}
		</Label>

		<Label for="score" class="float-right">{q.Score || ''}</Label>

		<Label for="title" class="ml-4 ">{q.Description || ''}</Label>

		{#each optionsArray as o}
			<div class="bg-[3a994c]">
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
		{#if errors[q.id]}
			<p class="text-red-600 text-xs mt-1">{errors[q.id]}</p>
		{/if}
		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end  p-2">{q.Hint || ''}</Label>
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
