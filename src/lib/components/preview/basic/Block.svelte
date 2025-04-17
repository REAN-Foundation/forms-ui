<script lang="ts">
	import MultipleChoice from './MultipleChoice.svelte';
	import SingleChoice from './SingleChoice.svelte';
	// import Question from './Question.svelte';
	import Boolean from './BooleanChoice.svelte';
	import BloodPressurePreview from '../healthCare/BloodPressurePreview.svelte';
	import Question from './Question.svelte';
	import {
		HeightPreview,
		PulseRatePreview,
		TemperaturePreview,
		WeightPreview
	} from '../healthCare';

	let { q } = $props();
	// console.log(q)
</script>

<div class="">
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
	{:else if q.ResponseType === 'Glucose' || q.ResponseType === 'BloodOxygenSaturation' || q.ResponseType === 'Hematocrit' || q.ResponseType === 'Cholesterol' || q.ResponseType === 'RespiratoryRate' || q.ResponseType === 'Electrolytes' || q.ResponseType === 'KidneyFunction' || q.ResponseType === 'WaistCircumference' || q.ResponseType === 'Sleep' || q.ResponseType === 'CReactiveProtein' || q.ResponseType === 'Lipoprotein'}
		<Question question={q} />
	{/if}
</div>
