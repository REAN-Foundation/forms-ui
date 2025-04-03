<script>
	import QuestionPaper from './QuestionPaper.svelte';
	import {
		BoolSubmission,
		DateSubmission,
		FileSubmission,
		FloatIntegerSubmission,
		MultipleChoicesSubmission,
		RangeSubmission,
		RatingSubmission,
		SingleChoiceSubmission,
		TextSubmission
	} from './basic';
	import {
		BloodOxygenSubmission,
		BloodPressureSubmission,
		CholesterolSubmission,
		GlucoseSubmission,
		HeightSubmission,
		LipoproteinSubmission,
		PulseRateSubmission,
		SleepSubmission,
		TemperatureSubmission,
		WeightSubmission
	} from './healthCare';

	/////////////////////////////////////////////////////////////////////////////////

	let { sections, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();

	const componentsMap = {
		Text: TextSubmission,
		Float: FloatIntegerSubmission,
		Integer: FloatIntegerSubmission,
		Boolean: BoolSubmission,
		Object: TextSubmission,
		TextArray: TextSubmission,
		File: FileSubmission,
		SingleChoiceSelection: SingleChoiceSubmission,
		MultiChoiceSelection: MultipleChoicesSubmission,
		Date: DateSubmission,
		DateTime: DateSubmission,
		Rating: RatingSubmission,
		Range: RangeSubmission,

		Height: HeightSubmission,
		Weight: WeightSubmission,
		Temperature: TemperatureSubmission,
		PulseRate: PulseRateSubmission,
		BloodPressure: BloodPressureSubmission,
		Sleep: SleepSubmission,
		Glucose: GlucoseSubmission,
		Cholesterol: CholesterolSubmission,
		BloodOxygenSaturation: BloodOxygenSubmission,
		Lipoprotein: LipoproteinSubmission
	};
</script>

{#each sections ?? [] as s}
	<div class="mb-4 min-h-[300px] border p-5">
		<h4 class="text-md font-semibold">
			Section: {s.Title || 'Untitled Section'}
		</h4>

		<p class="text-sm text-gray-600">
			{s.Description}
		</p>

		{#each s?.Questions ?? [] as sq, index}
			<div class="mt-2 border p-3">
				<svelte:component
					this={componentsMap[sq.ResponseType]}
					q={sq}
					bind:answers
					bind:errors
					{isSubmitted}
				/>
			</div>
		{/each}

		<div class=" p-5">
			{#if s?.Subsections?.length > 0}
				<QuestionPaper sections={s.Subsections} bind:answers bind:errors {isSubmitted} />
			{/if}
		</div>
	</div>
{/each}
