<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	export let q;
	// export let submit;
	export let answers;

	function handleInput(event, id) {
		answers[id] = +event.target.value;
	}
</script>

<!-- {#if q.Title} -->
<div class="flex w-full flex-col gap-1.5 p-4">
	<Label for={q.Title}>{q.Title || 'No title provided'}</Label>

	<Label for="score" class="float-right">{q.Score || ''}</Label>

	{#if q.Description}
		<Label for="title" class="ml-4 ">{q.Description || ''}</Label><br />
	{/if}
	<Input
		name={q.id}
		bind:value={answers[q.id]}
		type="text"
		/>
		<!-- oninput={(e) => handleInput(e, q.id)} -->
	<div class="flex justify-end">
		{#if q.Hint}
			<Label for="hint" class="float-right ml-auto mt-4 justify-end  p-2">Hint: {q.Hint}</Label>
		{/if}
	</div>
</div>
<!-- {/if} -->
<!-- 
<div class=" mt-4 w-full justify-between rounded-md border p-4">
	<div>
		<label for="title" class="text-lg font-semibold ">{q.Title}</label>
		{#if q.Score}
			<label for="score" class="float-right">{q.Score}</label>
		{/if}
		<br />
		{#if q.Description}
			<label for="title" class="ml-4 ">{q.Description}</label><br />
		{/if}
		<input
			name={q.id}
			bind:value={answers[q.id]}
			type="text"
			class="input mt-2 h-10 w-[90%] rounded-md"
		/>
		<div class="flex justify-end">
			{#if q.Hint}
				<label for="hint" class="float-right ml-auto mt-4 justify-end  p-2"
					>Hint: {q.Hint}</label
				>
			{/if}
		</div>
	</div>
</div> -->
