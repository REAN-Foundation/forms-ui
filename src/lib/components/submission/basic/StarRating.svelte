<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable() } = $props();
	let value = $state(q.RangeMin); // Current rating value
	let max = $state(q.RangeMax ); // Maximum number of stars
	let readonly = $state(false); // If true, disables interaction
	let hoverIndex = 0;

	function setRating(index) {
		event.preventDefault();
		event.stopPropagation();
		if (!readonly) {
			value = index;
		}
	}
	$effect(() => {
		answers[q.id] = value;
	})
</script>

<!-- {#if q.Title} -->
<div class="flex w-full flex-col gap-1.5 p-4">
	<div class="flex flex-row justify-between items-center">
		<Label for="title"
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		<Label for="score">{q.Score || ''}</Label>
	</div>

	{#if q.Description}
		<Label for="title" class="ml-2">{q.Description}</Label>
	{/if}
<!-- 
	<Input
		type="number"
		class="w-full "
		name={q.id}
		min={q?.RangeMin}
		max={q?.RangeMax}
		bind:value={answers[q.id]}
	/> -->
	<div class="rating">
		{#each Array(max).fill(0) as _, i}
			<button
			
			
				class="star {i < value ? 'filled' : ''}"
				onmouseover={() => (hoverIndex = i + 1)}
				onmouseleave={() => (hoverIndex = 0)}
				onclick={() => setRating(i + 1)}
			>
				★
			</button>
		{/each}
	</div>
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}
	{#if q.Hint}
		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end  p-2">Hint: {q.Hint}</Label>
		</div>
	{/if}
</div>

<!-- {/if} -->

<style>
	.rating {
		display: flex;
		gap: 5px;
		font-size: 24px;
		cursor: pointer;
	}
	.star {
		color: gray;
		transition: color 0.2s;
	}
	.star.filled,
	.star:hover {
		color: gold;
	}
</style>
