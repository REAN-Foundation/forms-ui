<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import TextForm from '../forms/responseType/TextFieldEditor.svelte';
	import FloatForm from '../forms/responseType/FloatFieldEditor.svelte';
	import IntegerForm from '../forms/responseType/IntegerFieldEditor.svelte';
	import BooleanForm from '../forms/responseType/BooleanFieldEditor.svelte';
	import ObjectForm from '../forms/responseType/ObjectFieldEditor.svelte';
	import TextArrayForm from '../forms/responseType/TextArrayFieldEditor.svelte';
	import MultipleChoiceSelectionForm from '../forms/responseType/MultipleChoiceSelectionFieldEditor.svelte';
	import SingleChoiceSelectionForm from '../forms/responseType/SingleChoiceSelectionFieldEditor.svelte';
	import DateForm from '../forms/responseType/DateFieldEditor.svelte';
	import DateTimeForm from '../forms/responseType/DateTimeFieldEditor.svelte';
	import RatingForm from '../forms/responseType/RatingFieldEditor.svelte';
	import RangeForm from '../forms/responseType/RangeFieldEditor.svelte';
	import AdvanceForm from '../forms/responseType/AdvanceFieldEditor.svelte';

	let { questionCard = $bindable(), errors = $bindable(), closeSheet, handleQuestionCardUpdate } = $props();

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
			<TextForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Float'}
			<FloatForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Integer'}
			<IntegerForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Boolean'}
			<BooleanForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Object'}
			<ObjectForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'TextArray'}
			<TextArrayForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate}/>
		{:else if questionCard.ResponseType === 'MultiChoiceSelection'}
			<MultipleChoiceSelectionForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'SingleChoiceSelection'}
			<SingleChoiceSelectionForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Date'}
			<DateForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'DateTime'}
			<DateTimeForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Rating'}
			<RatingForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else if questionCard.ResponseType === 'Range'}
			<RangeForm bind:questionCard={questionCard} bind:errors={errors}  {handleQuestionCardUpdate} />
		{:else}
			<AdvanceForm {questionCard} />
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
