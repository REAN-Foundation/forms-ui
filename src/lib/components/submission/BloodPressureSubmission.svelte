<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable() } = $props();

	// let jsonObject = $state({
	// 	Systolic: '',
	// 	Distolic: '',
	// 	Unit: 'mmHg'
	// });
	let selectedBPValues = $state({
		Systolic: '',
		Distolic: '',
		Unit: 'mmHg'
	});
	// let selectedBPValues = $derived(jsonObject);
	$effect(() => {
	// 	jsonObject = JSON.parse(answers[q.id] || null) || {
	// 		Systolic: '',
	// 		Distolic: '',
	// 		Unit: 'mmHg'
	// 	};

		answers[q.id] = JSON.stringify(selectedBPValues);
	});
	$inspect('This is jsonObject', selectedBPValues);
	$inspect('This is answers', answers[q.id]);
</script>

<!-- {#if q.Title} -->
<div class="flex w-full flex-col gap-1.5 p-4">
	<Label for="title"
		>{q.Title || 'No title provided'}
		{#if q.IsRequired}
			<span class="ml-1 text-red-600">*</span>
		{/if}
	</Label>

	<!-- <Label>Drop file here{q.ResponseType}</Label> -->

	<Label for="score" class="float-right">{q.Score || ''}</Label>

	<Label for="title" class="ml-4 text-slate-700">{q.Description || 'No description provided'}</Label
	>

	<Input type="text" class=" w-full" bind:value={answers[q.id]} hidden />
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}
	<div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<!-- <p>Types </p> -->
			<div class="flex flex-col items-start justify-start space-y-2">
				<div class=" flex flex-row">
					<Label for="Celsius">Systolic</Label>
					<Input
						type="text"
						name={q.id}
						bind:value={selectedBPValues.Systolic}
						placeholder="Celsius"
					/>
				</div>
				<div class=" flex flex-row">
					<Label for="Fahrenheit">Distolic</Label>
					<Input
						type="text"
						name={q.id}
						bind:value={selectedBPValues.Distolic}
						placeholder="Fahrenheit"
					/>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- {/if} -->
