<script lang="ts">
	import MultipleChoice from './basic/MultipleChoice.svelte';
	import SingleChoice from './basic/SingleChoice.svelte';
	import Boolean from './basic/BooleanChoice.svelte';
	import Question from './basic/Question.svelte';
	import {
		BloodOxygenPreview,
		CholesterolPreview,
		GlucosePreview,
		HeightPreview,
		LipoproteinPreview,
		PulseRatePreview,
		SleepPreview,
		TemperaturePreview,
		WeightPreview,
		BloodPressurePreview
	} from './healthCare';

	let { q } = $props();

	// Define all component mappings
	const questionComponents = [
		{ responseType: 'Text', component: Question },
		{ responseType: 'Float', component: Question },
		{ responseType: 'Integer', component: Question },
		{ responseType: 'File', component: Question },
		{ responseType: 'Object', component: Question },
		{ responseType: 'TextArray', component: Question },
		{ responseType: 'SingleChoiceSelection', component: SingleChoice },
		{ responseType: 'Boolean', component: Boolean },
		{ responseType: 'MultiChoiceSelection', component: MultipleChoice },
		{ responseType: 'DateTime', component: Question },
		{ responseType: 'Date', component: Question },
		{ responseType: 'Range', component: Question },
		{ responseType: 'Rating', component: Question },
		{ responseType: 'Height', component: HeightPreview },
		{ responseType: 'Weight', component: WeightPreview },
		{ responseType: 'Temperature', component: TemperaturePreview },
		{ responseType: 'PulseRate', component: PulseRatePreview },
		{ responseType: 'BloodPressure', component: BloodPressurePreview },
		{ responseType: 'Glucose', component: GlucosePreview },
		{ responseType: 'Cholesterol', component: CholesterolPreview },
		{ responseType: 'BloodOxygenSaturation', component: BloodOxygenPreview },
		{ responseType: 'Sleep', component: SleepPreview },
		{ responseType: 'Lipoprotein', component: LipoproteinPreview }
	];

	// Initialize with the first component
	let selected = $state(questionComponents[0]);

	// Function to find the matching component based on q.ResponseType
	$effect(() => {
		const matched = questionComponents.find((comp) => comp.responseType === q.ResponseType);
		if (matched) {
			selected = matched;
		}
	});
</script>

<!-- Render the selected component -->
<selected.component question={q} />
<!-- <div class="">
	{#if q.ResponseType === 'Text'}
		<Question question={q} />
	{:else if q.ResponseType === 'Float' || q.ResponseType === 'Integer'}
		<Question question={q} />
	{:else if q.ResponseType == 'File'}
		<Question question={q} />
	{:else if q.ResponseType == 'Object' || q.ResponseType == 'TextArray'}
		<Question question={q} />
	{:else if q.ResponseType === 'SingleChoiceSelection'}
		<SingleChoice question={q} />
	{:else if q.ResponseType === 'Boolean'}
		<Boolean question={q} />
	{:else if q.ResponseType === 'MultiChoiceSelection'}
		<MultipleChoice question={q} />
	{:else if q.ResponseType === 'DateTime' || q.ResponseType === 'Date'}
		<Question question={q} />
	{:else if q.ResponseType === 'Range'}
		<Question question={q} />
	{:else if q.ResponseType === 'Rating'}
		<Question question={q} />
	{:else if q.ResponseType === 'Height'}
		<HeightPreview question={q} />
	{:else if q.ResponseType === 'Weight'}
		<WeightPreview question={q} />
	{:else if q.ResponseType === 'Temperature'}
		<TemperaturePreview question={q} />
	{:else if q.ResponseType === 'PulseRate'}
		<PulseRatePreview question={q} />
	{:else if q.ResponseType === 'BloodPressure'}
		<BloodPressurePreview question={q} />
	{:else if q.ResponseType === 'Glucose' || q.ResponseType === 'BloodOxygenSaturation' || q.ResponseType === 'Cholesterol' || q.ResponseType === 'Sleep' || q.ResponseType === 'Lipoprotein'}
		<Question question={q} />
	{/if}
</div> -->
