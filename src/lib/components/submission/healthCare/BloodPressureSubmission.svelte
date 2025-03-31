<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let { q, answers = $bindable(), errors = $bindable() } = $props();

	let selectedBPValues = $state({
		Systolic: '',
		Diastolic: '',
		Unit: 'mmHg'
	});

	$inspect('This is answers', answers[q.id]);
	$inspect('This is selectedBPValues', selectedBPValues);

	const updateAnswers = (event) => {
		answers[q.id] = JSON.stringify(selectedBPValues);
	};

	$effect(() => {
		if (answers[q.id]) {
			selectedBPValues = JSON.parse(answers[q.id]);
		}
	});
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

	<Label for="title" class="ml-4 text-slate-700">{q.Description}</Label
	>

	<Input type="text" class="hidden w-full" bind:value={answers[q.id]} />

	<!-- <div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<div class="flex flex-col items-start justify-start space-y-2">
				<div class=" flex flex-row">
					<Label for="Celsius">Systolic</Label>
					<Input
						type="text"
						name={q.id}
						bind:value={selectedBPValues.Systolic}
						placeholder="Celsius"
                        oninput={updateAnswers}
					/>
					<Label>mmHg</Label>
				</div>
				<div class=" flex flex-row">
					<Label for="Fahrenheit">Distolic</Label>
					<Input
						type="text"
						name={q.id}
						bind:value={selectedBPValues.Diastolic}
						placeholder="Fahrenheit"
                        oninput={updateAnswers}
					/>
						<Label>mmHg</Label>
				</div>
			</div>
		</div>
	</div> -->

	<div class="w-full space-y-3 rounded-lg">
		<div class="flex flex-col space-y-2">
			<div class="flex items-center space-x-2">
				<Label for="systolic" class=" mr-2">Systolic</Label>
				<Input
					type="text"
					name={q.id}
					bind:value={selectedBPValues.Systolic}
					placeholder="Enter the systolic blood pressure here..."
					oninput={updateAnswers}
				/>

				<Label for="umit" class="">mmHg</Label>
			</div>
			<div class="flex items-center space-x-2">
				<Label for="diastolic" class="">Diastolic</Label>
				<Input
					type="text"
					name={q.id}
					bind:value={selectedBPValues.Diastolic}
					placeholder="Enter the distolic blood pressure here..."
					oninput={updateAnswers}
				/>
				<Label for="umit" class="">mmHg</Label>
			</div>
		</div>
	</div>
	
	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}
</div>
<!-- </div> -->
<!-- {/if} -->
