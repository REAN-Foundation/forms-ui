<script>
	import BloodOxygen from './healthCare/BloodOxygen.svelte';
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
		BloodPressureSubmission,
		HeightForm,
		PulseRateForm,
		TemperatureForm,
		WeightForm
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
		Height: HeightForm,
		Weight: WeightForm,
		Temperature: TemperatureForm,
		PulseRate: PulseRateForm,
		BloodPressure: BloodPressureSubmission,
		Glucose: BloodOxygen,
		BloodOxygenSaturation: BloodOxygen,
		Hematocrit: BloodOxygen,
		Cholesterol: BloodOxygen,
		RespiratoryRate: BloodOxygen,
		Electrolytes: BloodOxygen,
		KidneyFunction: BloodOxygen,
		Lipoprotein: BloodOxygen,
		CReactiveProtein: BloodOxygen,
		Sleep: BloodOxygen,
		HemoglobinA1C: BloodOxygen,
		WaistCircumference: BloodOxygen
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
			{/if}
		</div>
	</div>
{/each}
