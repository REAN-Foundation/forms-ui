<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
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
	import AdvanceForm from '../forms/responseType/healthCare/AdvanceFieldEditor.svelte';
	import {
		HeightForm,
		WeightForm,
		TemperatureForm,
		PulseRateForm,
		BloodPressureForm
	} from '../forms/responseType/healthCare/index';

	///////////////////////////////////////////////////////////////////////

	let {
		questionCard = $bindable(),
		errors = $bindable(),
		closeSheet,
		handleQuestionCardUpdate
	} = $props();

	console.log('question card', questionCard);
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
			<div class="bg-secondary w-full flex justify-between p-3">
				<div class=" flex flex-col">
					<h2 class="text-lg font-semibold text-black ">Edit Question</h2>
	
					<p class="text-sm text-black ">Make changes to your question here.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" onclick={() => closeSheet()}>
					<Icon icon="mdi:close" class="" />
				</Button>
			</div>
			
		</div>
		<!-- {JSON.stringify(questionCard.ResponseType)} -->

		<!-- <FielEditorForm {questionCard} {closeModel} /> -->
    <div class="h-screen overflow-y-hidden">

		{#if questionCard.ResponseType === 'Text'}
			<TextForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Float'}
			<FloatForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Integer'}
			<IntegerForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Boolean'}
			<BooleanForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Object'}
			<ObjectForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'TextArray'}
			<TextArrayForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'MultiChoiceSelection'}
			<MultipleChoiceSelectionForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'SingleChoiceSelection'}
			<SingleChoiceSelectionForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Date'}
			<DateForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'DateTime'}
			<DateTimeForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Rating'}
			<RatingForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Range'}
			<RangeForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Height'}
			<HeightForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Weight'}
			<WeightForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Temperature'}
			<TemperatureForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'PulseRate'}
			<PulseRateForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'BloodPressure'}
			<BloodPressureForm bind:questionCard bind:errors {handleQuestionCardUpdate} />
		{:else}
			<AdvanceForm {questionCard} bind:errors {handleQuestionCardUpdate} />
		{/if}
	</div>

	<!-- <div class="sticky bottom-0 mt-4 bg-secondary text-right p-2">
			<Button type="submit">Save changes</Button>
		</div> -->
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
