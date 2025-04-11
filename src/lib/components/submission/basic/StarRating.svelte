<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable() } = $props();
	let value = $state(q.RangeMin); // Current rating value
	let max = $state(q.RangeMax); // Maximum number of stars
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
	});
</script>

<!-- {#if q.Title} -->
<div class=" space-y-2 rounded-lg px-4 pt-4">
	<div class="flex justify-between">
		<Label for="title" class=" text-sm"
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		{#if q.Score}
			<Label for="score" class="text-sm font-medium">{q.Score}</Label>
		{/if}
	</div>

	{#if q.Description}
		<Label for="title" class="text-xs text-gray-500">{q.Description}</Label>
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
		<p class=" text-end text-xs text-gray-400">Hint: {q.Hint}</p>
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
