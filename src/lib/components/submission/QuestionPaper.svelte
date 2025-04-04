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
	<div class="my-2 rounded-md border-gray-400 pt-4 dark:bg-[#0a0a0b]">
		<h1 class=" mt-3 px-4 text-center text-lg font-semibold">
			Section: {s.Title || 'Untitled Section'}
		</h1>
		<p class="mb-3 px-4 text-center text-xs font-semibold text-gray-600">
			{s.Description}
		</p>

		<div class="my-5 px-5">
			{#each s?.Questions ?? [] as sq, index}
				<div class="">
					<svelte:component
						this={componentsMap[sq.ResponseType]}
						q={sq}
						bind:answers
						bind:errors
						{isSubmitted}
					/>
				</div>
			{/each}
		</div>

		<div class="mx-3 rounded-lg border">
			{#if s?.Subsections?.length > 0}
				<QuestionPaper sections={s.Subsections} bind:answers bind:errors {isSubmitted} />
				<QuestionPaper sections={s.Subsections} bind:answers bind:errors {isSubmitted} />
			{/if}
		</div>
	</div>
{/each}
