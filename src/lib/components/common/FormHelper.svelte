<script lang="ts">
	import { fly } from 'svelte/transition';
	import FielEditorForm from '../forms/FieldEditor.svelte';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import TextForm from '../forms/responseType/TextForm.svelte';
	import FloatForm from '../forms/responseType/FloatForm.svelte';
	import IntegerForm from '../forms/responseType/IntegerForm.svelte';
	import BooleanForm from '../forms/responseType/BooleanForm.svelte';
	import ObjectForm from '../forms/responseType/ObjectForm.svelte';
	import TextArrayForm from '../forms/responseType/TextArrayForm.svelte';
	import MultipleChoiceSelectionForm from '../forms/responseType/MultipleChoiceSelectionForm.svelte';
	import SingleChoiceSelectionForm from '../forms/responseType/SingleChoiceSelectionForm.svelte';
	import DateForm from '../forms/responseType/DateForm.svelte';
	import DateTimeForm from '../forms/responseType/DateTimeForm.svelte';
	import RatingForm from '../forms/responseType/RatingForm.svelte';
	import RangeForm from '../forms/responseType/RangeForm.svelte';
	import AdvanceForm from '../forms/responseType/AdvanceForm.svelte';

	let { questionCard = $bindable(), errors = $bindable(), closeModel, closeSheet, handleQuestionCardUpdate } = $props();

	console.log('question card', questionCard);
</script>

<div class="relative">
	<button
		class="blur-background fixed inset-0 z-40 bg-black bg-opacity-10 backdrop-blur-sm"
		onclick={() => closeSheet()}
		onkeydown={(e) => e.key === 'Escape' && closeSheet()}
		aria-label="Close sheet"
	></button>

	<div
		class="custom-scrollbar fixed right-0 top-0 z-50 h-full min-h-screen w-[46%] overflow-y-auto rounded-sm shadow-lg"
		in:fly={{ x: 500, duration: 500 }}
		out:fly={{ x: 500, duration: 500 }}
		role="dialog"
		aria-modal="true"
	>
		<div class="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4">
			<h2 class="text-md text-white">Form Title</h2>
			<Button type="button" variant="destructive" onclick={() => closeSheet()}>
				<Icon icon="hugeicons:cancel-01" width="15" height="15" />
			</Button>
		</div>
		<!-- {JSON.stringify(questionCard.ResponseType)} -->

		<!-- <FielEditorForm {questionCard} {closeModel} /> -->
		{#if questionCard.ResponseType === 'Text'}
			<TextForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Float'}
			<FloatForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Integer'}
			<IntegerForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Boolean'}
			<BooleanForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Object'}
			<ObjectForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'TextArray'}
			<TextArrayForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate}/>
		{:else if questionCard.ResponseType === 'MultiChoiceSelection'}
			<MultipleChoiceSelectionForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'SingleChoiceSelection'}
			<SingleChoiceSelectionForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Date'}
			<DateForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'DateTime'}
			<DateTimeForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Rating'}
			<RatingForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Range'}
			<RangeForm bind:questionCard={questionCard} bind:errors={errors} {closeModel} {handleQuestionCardUpdate} />
		{:else}
			<AdvanceForm {questionCard} {closeModel} />
		{/if}
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
