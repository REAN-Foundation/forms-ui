<script>
	// import FloatInteger from './FloatInteger.svelte';
	// import SingleChoice from './SingleChoice.svelte';
	// import Text from './Text.svelte';
	// import File from './File.svelte';
	// import MultipleChoices from './MultipleChoice.svelte';
	// import DateTime from './Datetime.svelte';
	// import Bool from './basic/Boolean.svelte';
	// import Range from './Range.svelte';
	// import Rating from './Rating.svelte';
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
	import { BloodPressureSubmission, HeightForm, PulseRateForm, TemperatureForm, WeightForm } from './healthCare';
	/////////////////////////////////////////////////////////////////////////////////

	let { sections, answers = $bindable(), errors = $bindable() } = $props();

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
				<svelte:component this={componentsMap[sq.ResponseType]} q={sq} bind:answers bind:errors />
			</div>
		{/each}

		<div class=" p-5">
			{#if s?.Subsections?.length > 0}
				<!-- {#each s?.Subsections ?? [] as ss}
								<h4 class="text-md mt-5 font-semibold">
									Sub Section: {ss.Title || 'Untitled Sub Section'}
								</h4>
								<p class="text-sm text-gray-600">
									{ss.Description || 'No description provided.'}
								</p>

								{#each ss?.Questions ?? [] as ssq, index}
									<div class="mt-2 border p-3">
										<svelte:component this={componentsMap[ssq.ResponseType]} q={ssq} bind:answers />
									</div>
								{/each}
							{/each} -->
				<QuestionPaper sections={s.Subsections} bind:answers bind:errors />
				<!-- <p>subsection</p> -->
			{/if}
		</div>
	</div>
{/each}
