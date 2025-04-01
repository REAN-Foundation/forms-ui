<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { QuestionUpdateModel } from '../../../common/questionTypes';
	import { questionSchema } from '../../question-schema';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard = $bindable(), errors = $bindable(), handleQuestionCardUpdate } = $props();

	let options = $state(questionCard.Options ? [...questionCard.Options] : []);

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			const updatedOptions = options.map((option, index) => ({
				Text: option.Text,
				Sequence: option.Sequence || index + 1,
				ImageUrl: option.ImageUrl
			}));

			const model: QuestionUpdateModel = {
				id: questionCard.id,
				Title: questionCard.Title,
				Description: questionCard.Description,
				ResponseType: questionCard.ResponseType,
				Score: questionCard.Score,
				CorrectAnswer: questionCard.CorrectAnswer,
				Hint: questionCard.Hint,
				QuestionImageUrl: questionCard.QuestionImageUrl,
				Options: updatedOptions,
				IsRequired: questionCard.IsRequired
			};

			questionCard.Options = updatedOptions;
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
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	}

	const hardcodedImageUrl = 'https://example.com/default';

	function addOption() {
		if (questionCard.ResponseType === 'Boolean' && options.length >= 2) return;

		// Add a new option
		options = [
			...options,
			{ Sequence: (options.length + 1).toString(), Text: '', ImageUrl: hardcodedImageUrl }
		];
	}

	function updateOption(index, key, value) {
		// Update the option at the specified index
		options[index] = { ...options[index], [key]: value };
		// Trigger reactivity by reassigning the array
		options = [...options];
	}

	function removeOption(index) {
		// Remove the option at the specified index
		options = options.filter((_, i) => i !== index);
	}
</script>

<Card.Root class="rounded-none border-none bg-[#fafaf9] p-4 dark:bg-[#0a0a0b]">
	<form
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2"
		onsubmit={(event) => {
			event.preventDefault();
			handleSubmit(event);
		}}
	>
		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Id</Label>
		</div>
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
		<p class="error">{errors?.IsRequired}</p>

		<div class="my-2 flex flex-col">
			<Label>Options<span class="text-red-600">*</span></Label>
			<Button
				type="button"
				onclick={addOption}
				class="my-4 w-fit"
				disabled={questionCard.ResponseType === 'Boolean' && options.length >= 2}
			>
				Add Option
			</Button>

			{#each options as option, index}
				<div class="mb-2 flex items-center">
					<Input
						type="number"
						name={`options[${index}].Sequence`}
						bind:value={option.Sequence}
						oninput={(e) => updateOption(index, 'Sequence', e.target.value)}
						placeholder={`Sequence of ${index + 1} Option`}
						class="mr-2 w-1/4"
					/>
					<Input
						type="text"
						name={`options[${index}].Text`}
						bind:value={option.Text}
						oninput={(e) => updateOption(index, 'Text', e.target.value)}
						placeholder={`Data for Option ${index + 1}`}
						class="mr-2 w-full"
					/>
					<Input type="hidden" name={`options[${index}].ImageUrl`} bind:value={option.ImageUrl} />
					<Button type="button" onclick={() => removeOption(index)} class="ml-2">
						<Icon icon="mingcute:delete-2-line" width="25" height="25" />
					</Button>
				</div>
			{/each}

			<input type="hidden" name="options" value={JSON.stringify(options)} />
		</div>

		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Response Type</Label>
		</div>
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
			<Label class="col-span-11">Correct Answer</Label>
		</div>
		<Input bind:value={questionCard.CorrectAnswer} />
		<p class="text-destructive">{errors?.CorrectAnswer}</p>

		<!-- <div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Question Image Url</Label>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />
		<p class="text-destructive">{errors?.QuestionImageUrl}</p> -->

		<Dialog.Footer class="mt-4">
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</form>
</Card.Root>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 2px;
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
