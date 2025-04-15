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
	import {
		AddressPreview,
		AgePreview,
		BirthDatePreview,
		EmailPreview,
		GenderPreview,
		NamePreview,
		PhoneNumberPreview
	} from './common';

	let { q } = $props();

	// Define all component mappings
	const questionComponents = [
		// Basic plugins
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

		//Health Care plugins
		{ responseType: 'Height', component: HeightPreview },
		{ responseType: 'Weight', component: WeightPreview },
		{ responseType: 'Temperature', component: TemperaturePreview },
		{ responseType: 'PulseRate', component: PulseRatePreview },
		{ responseType: 'BloodPressure', component: BloodPressurePreview },
		{ responseType: 'Glucose', component: GlucosePreview },
		{ responseType: 'Cholesterol', component: CholesterolPreview },
		{ responseType: 'BloodOxygenSaturation', component: BloodOxygenPreview },
		{ responseType: 'Sleep', component: SleepPreview },
		{ responseType: 'Lipoprotein', component: LipoproteinPreview },

		// Common plugins
		{ responseType: 'Name', component: NamePreview },
		{ responseType: 'Age', component: AgePreview },
		{ responseType: 'BirthDate', component: BirthDatePreview },
		{ responseType: 'PhoneNumber', component: PhoneNumberPreview },
		{ responseType: 'Gender', component: GenderPreview },
		{ responseType: 'Email', component: EmailPreview },
		{ responseType: 'Address', component: AddressPreview }
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
