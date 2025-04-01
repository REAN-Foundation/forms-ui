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

	let { sections, answers = $bindable(), errors = $bindable(),isSubmitted } = $props();

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
	<div class="mb-4 min-h-[300px] border p-5">
		<h4 class="text-md font-semibold">
			Section: {s.Title || 'Untitled Section'}
		</h4>
		<p class="text-sm text-gray-600">
			{s.Description || 'No description provided.'}
		</p>

		{#each s?.Questions ?? [] as sq, index}
			<div class="mt-2 border p-3">
				<svelte:component this={componentsMap[sq.ResponseType]} q={sq} bind:answers bind:errors {isSubmitted}/>
			</div>
		{/each}

		<div class=" p-5">
			{#if s?.Subsections?.length > 0}
				<QuestionPaper sections={s.Subsections} bind:answers bind:errors {isSubmitted}/>
			{/if}
		</div>
	</div>
{/each}
