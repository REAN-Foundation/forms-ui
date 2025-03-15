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

	let { questionCard, closeModel, closeSheet } = $props();

	// console.log(formDataForForm, 'this is pageData');
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
		<!-- {JSON.stringify(questionCard)} -->

		<FielEditorForm {questionCard} {closeModel} />
		{#if questionCard.ResponseType === 'Text'}
			<TextForm {questionCard} {closeModel} />
		{:else if questionCard === 'Float'}
			<FloatForm {questionCard} {closeModel} />
		{:else if questionCard === 'Integer'}
			<IntegerForm {questionCard} {closeModel} />
		{:else if questionCard === 'Boolean'}
			<BooleanForm {questionCard} {closeModel} />
		{:else if questionCard === 'Object'}
			<ObjectForm {questionCard} {closeModel} />
		{:else if questionCard === 'TextArray'}
			<TextArrayForm {questionCard} {closeModel} />
		{:else if questionCard === 'MultiChoiceSelection'}
			<MultipleChoiceSelectionForm {questionCard} {closeModel} />
		{:else if questionCard === 'SingleChoiceSelection'}
			<SingleChoiceSelectionForm {questionCard} {closeModel} />
		{:else if questionCard === 'Date'}
			<DateForm {questionCard} {closeModel} />
		{:else if questionCard === 'DateTime'}
			<DateTimeForm {questionCard} {closeModel} />
		{:else if questionCard === 'Rating'}
			<RatingForm {questionCard} {closeModel} />
		{:else if questionCard === 'Range'}
			<RangeForm {questionCard} {closeModel} />
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
