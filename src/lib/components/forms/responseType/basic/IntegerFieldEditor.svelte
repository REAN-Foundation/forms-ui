<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import type { QuestionUpdateModel } from '../../../common/questionTypes';
	import { questionSchema } from '../../question-schema';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ValidationLogicIntegration from '$lib/components/validation/ValidationLogicIntegration.svelte';
	import SkipLogicIntegration from '$lib/components/skip-logic/SkipLogicIntegration.svelte';
	import CalculationLogicIntegration from '$lib/components/calculation-logic/CalculationLogicIntegration.svelte';
	import Icon from '@iconify/svelte';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard = $bindable(), errors = $bindable(), handleQuestionCardUpdate, questionList } = $props();

		function handleValidationSaved(validationData) {
		console.log('Validation logic saved for field:', questionCard.id, validationData);
		// Here you would typically send this to your backend API
		// Following the structure you provided in the requirements
	}

	function handleSkipLogicSaved(skipLogicData) {
		console.log('Skip logic saved for field:', questionCard.id, skipLogicData);
		// Here you would typically send this to your backend API
		// Following the structure you provided in the requirements
	}

	function handleCalculationLogicSaved(calculationData) {
		console.log('Calculation logic saved for field:', questionCard.id, calculationData);
		// Here you would typically send this to your backend API
		// Following the structure you provided in the requirements
	}
	
	async function handleSubmit(event) {
		event.preventDefault();
		console.log(questionCard.Title);

		const model: QuestionUpdateModel = {
			id: questionCard.id,
			Title: questionCard.Title,
			Description: questionCard.Description,
			ResponseType: questionCard.ResponseType,
			Score: questionCard.Score,
			CorrectAnswer: questionCard.CorrectAnswer,
			Hint: questionCard.Hint,
			QuestionImageUrl: questionCard.QuestionImageUrl,
			IsRequired: questionCard.IsRequired
		};

		const result = await questionSchema.safeParseAsync(model);
		if (!result.success) {
			console.log('client side validation error', result.error.flatten().fieldErrors);
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
		}

		if (Object.keys(errors).length === 0 || result?.success) {
			console.log('Called handleQuestionCardUpdate');
			handleQuestionCardUpdate(model);
		}
	}
</script>

<Card.Root class="rounded-none border-none  p-4 ">
	<form
		class="flex flex-col h-[calc(100vh-2rem)]"
		onsubmit={(event) => {
			event.preventDefault();
			handleSubmit(event);
		}}
	>
		<!-- Scrollable Content Area -->
		<div class="flex-1 overflow-y-auto px-2 pb-4">
			<Input bind:value={questionCard.id} class="hidden" />

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11">Title<span class="text-red-600">*</span></Label>
			</div>
			<Input bind:value={questionCard.Title} />
			<p class="text-destructive">{errors?.Title}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11">Description</Label>
			</div>
			<Input bind:value={questionCard.Description} />
			<p class="text-destructive">{errors?.Description}</p>

			<div class="relative my-4 grid grid-cols-12 items-center gap-4">
				<div class="col-span-11 flex items-center space-x-2">
					<Label for="isRequired">Required</Label>
					<input
						id="isRequired"
						type="checkbox"
						bind:checked={questionCard.IsRequired}
						aria-labelledby="isRequired"
						class="h-4 w-4"
					/>
				</div>
			</div>
			<p class="text-destructive">{errors?.IsRequired}</p>

			<Input bind:value={questionCard.ResponseType} class="hidden" />

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11">Score</Label>
			</div>
			<Input bind:value={questionCard.Score} type="number" />
			<p class="text-destructive">{errors?.Score}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11">Hint</Label>
			</div>
			<Input bind:value={questionCard.Hint} />
			<p class="text-destructive">{errors?.Hint}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11">CorrectAnswer</Label>
			</div>
			<Input bind:value={questionCard.CorrectAnswer} />
			<p class="text-destructive">{errors?.CorrectAnswer}</p>

			<!-- <div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11">Question Image Url</Label>
			</div>
			<Input bind:value={questionCard.QuestionImageUrl} />
			<p class="text-destructive">{errors?.QuestionImageUrl}</p> -->

			<!-- VALIDATION LOGIC INTEGRATION -->
			<ValidationLogicIntegration 
				fieldId={questionCard.id}
				fieldName={questionCard.Title || 'Text Field'}
				onValidationSaved={handleValidationSaved}
				{questionCard}
				{questionList}
			/>

			<!-- SKIP LOGIC INTEGRATION -->
			<SkipLogicIntegration 
				fieldId={questionCard.id}
				fieldName={questionCard.Title || 'Text Field'}
				onSkipLogicSaved={handleSkipLogicSaved}
				{questionCard}
				{questionList}
			/>

			<!-- CALCULATION LOGIC INTEGRATION -->
			<CalculationLogicIntegration 
				fieldId={questionCard.id}
				fieldName={questionCard.Title || 'Text Field'}
				onCalculationLogicSaved={handleCalculationLogicSaved}
				{questionCard}
				{questionList}
			/>
		</div>

		<!-- Fixed Bottom Button -->
		<div class="sticky bottom-0 z-10  py-4  border-t border-gray-200 mt-4">
			<Button class="w-full" type="submit">
				<Icon icon="lucide:check" class="mr-2 h-4 w-4" />
				Update Question Card
			</Button>
		</div>
	</form>
</Card.Root>


