<!-- <script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	
	// Import all form components
	import { 
		BooleanForm,
		DateForm,
		DateTimeForm,
		FloatForm,
		IntegerForm,
		MultipleChoiceSelectionForm,
		ObjectForm,
		RangeForm,
		RatingForm,
		SingleChoiceSelectionForm,
		TextArrayForm,
		TextForm
	} from '../forms/responseType/basic/index';
	
	import {
		HeightForm,
		WeightForm,
		TemperatureForm,
		PulseRateForm,
		BloodPressureForm,
		SleepForm,
		GlucoseForm,
		CholesterolForm,
		BloodOxygenForm,
		LipoproteinForm
	} from '../forms/responseType/healthCare/index';
	
	import AdvanceForm from '../forms/responseType/healthCare/AdvanceFieldEditor.svelte';

	let {
		questionCard = $bindable(),
		errors = $bindable(),
		closeSheet,
		handleQuestionCardUpdate
	} = $props();

	// Component mapping dictionary
	const formComponents = {
		Text: TextForm,
		Float: FloatForm,
		Integer: IntegerForm,
		Boolean: BooleanForm,
		Object: ObjectForm,
		TextArray: TextArrayForm,
		MultiChoiceSelection: MultipleChoiceSelectionForm,
		SingleChoiceSelection: SingleChoiceSelectionForm,
		Date: DateForm,
		DateTime: DateTimeForm,
		Rating: RatingForm,
		Range: RangeForm,
		Height: HeightForm,
		Weight: WeightForm,

		Temperature: TemperatureForm,
		PulseRate: PulseRateForm,
		BloodPressure: BloodPressureForm,
		Sleep: SleepForm,
		Glucose: GlucoseForm,
		Cholesterol: CholesterolForm,
		BloodOxygenSaturation: BloodOxygenForm,
		Lipoprotein: LipoproteinForm
	};

	// Get the appropriate form component
	const FormComponent = $derived(
		formComponents[questionCard.ResponseType] || AdvanceForm
	);
</script>

<div class="relative">
	<button
		class="blur-background fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={() => closeSheet()}
		onkeydown={(e) => e.key === 'Escape' && closeSheet()}
		aria-label="Close sheet"
	></button>

	<div
		class="custom-scrollbar fixed right-0 top-0 z-50 h-full min-h-screen w-[65%] overflow-y-auto rounded-sm bg-[#fafaf9] shadow-lg md:w-[46%]"
		in:fly={{ x: 500, duration: 500 }}
		out:fly={{ x: 500, duration: 500 }}
		role="dialog"
		aria-modal="true"
	>
		<div class="sticky top-0 z-20 flex items-center justify-between bg-[#fafaf9] dark:bg-[#0a0a0b]">
			<div class="flex w-full justify-between bg-secondary p-3">
				<div class=" flex flex-col">
					<h2 class="text-lg font-semibold text-black">Edit Question</h2>
					<p class="text-sm text-black">Make changes to your question here.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" onclick={() => closeSheet()}>
					<Icon icon="mdi:close" class="" />
				</Button>
			</div>
		</div>

		<div class="h-screen overflow-y-hidden">
			<FormComponent 
				bind:questionCard 
				bind:errors 
				handleQuestionCardUpdate={handleQuestionCardUpdate} 
			/>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 1px;
		height: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #d70c0c;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style> -->

<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

	// Import all form components
	import {
		BooleanForm,
		DateForm,
		DateTimeForm,
		FloatForm,
		IntegerForm,
		MultipleChoiceSelectionForm,
		ObjectForm,
		RangeForm,
		RatingForm,
		SingleChoiceSelectionForm,
		TextArrayForm,
		TextForm
	} from '../forms/responseType/basic/index';

	import {
		HeightForm,
		WeightForm,
		TemperatureForm,
		PulseRateForm,
		BloodPressureForm,
		SleepForm,
		GlucoseForm,
		CholesterolForm,
		BloodOxygenForm,
		LipoproteinForm
	} from '../forms/responseType/healthCare/index';

	import AdvanceForm from '../forms/responseType/healthCare/AdvanceFieldEditor.svelte';

	let {
		questionCard = $bindable(),
		errors = $bindable(),
		closeSheet,
		handleQuestionCardUpdate
	} = $props();

	// Define all form options in an array
	const formOptions = [
		{ responseType: 'Text', component: TextForm },
		{ responseType: 'Float', component: FloatForm },
		{ responseType: 'Integer', component: IntegerForm },
		{ responseType: 'Boolean', component: BooleanForm },
		{ responseType: 'Object', component: ObjectForm },
		{ responseType: 'TextArray', component: TextArrayForm },
		{ responseType: 'MultiChoiceSelection', component: MultipleChoiceSelectionForm },
		{ responseType: 'SingleChoiceSelection', component: SingleChoiceSelectionForm },
		{ responseType: 'Date', component: DateForm },
		{ responseType: 'DateTime', component: DateTimeForm },
		{ responseType: 'Rating', component: RatingForm },
		{ responseType: 'Range', component: RangeForm },
		{ responseType: 'Height', component: HeightForm },
		{ responseType: 'Weight', component: WeightForm },
		{ responseType: 'Temperature', component: TemperatureForm },
		{ responseType: 'PulseRate', component: PulseRateForm },
		{ responseType: 'BloodPressure', component: BloodPressureForm },
		{ responseType: 'Sleep', component: SleepForm },
		{ responseType: 'Glucose', component: GlucoseForm },
		{ responseType: 'Cholesterol', component: CholesterolForm },
		{ responseType: 'BloodOxygenSaturation', component: BloodOxygenForm },
		{ responseType: 'Lipoprotein', component: LipoproteinForm }
	];

	// Initialize selected form based on questionCard.ResponseType
	let selected = $state(
		formOptions.find((option) => option.responseType === questionCard.ResponseType) || {
			responseType: 'Advance',
			component: AdvanceForm
		}
	);

	// Update selected form when questionCard.ResponseType changes
	$effect(() => {
		const matched = formOptions.find((option) => option.responseType === questionCard.ResponseType);
		if (matched) {
			selected = matched;
		} else {
			selected = { responseType: 'Advance', component: AdvanceForm };
		}
	});
</script>

<div class="relative">
	<button
		class="blur-background fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={() => closeSheet()}
		onkeydown={(e) => e.key === 'Escape' && closeSheet()}
		aria-label="Close sheet"
	></button>

	<div
		class="custom-scrollbar fixed right-0 top-0 z-50 h-full min-h-screen w-[65%] overflow-y-auto rounded-sm bg-[#fafaf9] shadow-lg md:w-[46%]"
		in:fly={{ x: 500, duration: 500 }}
		out:fly={{ x: 500, duration: 500 }}
		role="dialog"
		aria-modal="true"
	>
		<div class="sticky top-0 z-20 flex items-center justify-between bg-[#fafaf9] dark:bg-[#0a0a0b]">
			<div class="flex w-full justify-between bg-secondary p-3">
				<div class=" flex flex-col">
					<h2 class="text-lg font-semibold text-black">Edit Question</h2>
					<p class="text-sm text-black">Make changes to your question here.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" onclick={() => closeSheet()}>
					<Icon icon="mdi:close" class="" />
				</Button>
			</div>
		</div>

		<div class="h-screen overflow-y-hidden">
			<selected.component bind:questionCard bind:errors {handleQuestionCardUpdate} />
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 1px;
		height: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #d70c0c;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
