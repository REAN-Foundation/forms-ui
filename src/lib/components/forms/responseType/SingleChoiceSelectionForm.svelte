<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import InfoIcon from '$lib/components/common/InfoIcon.svelte';
	import Icon from '@iconify/svelte';
	import { questionSchema } from '../question.schema';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard=$bindable(), errors = $bindable(), closeModel, handleQuestionCardUpdate } = $props();

	let options = $state(questionCard.Options ? [...questionCard.Options] : []);

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			const updatedOptions = options.map((option, index) => ({
				Text: option.Text,
				Sequence: option.Sequence || index + 1,
				ImageUrl: option.ImageUrl
			}));

			const model = {
				id: questionCard.id,
				Title: questionCard.Title,
				Description: questionCard.Description,
				ResponseType: questionCard.ResponseType,
				Score: questionCard.Score,
				CorrectAnswer: questionCard.CorrectAnswer,
				Hint: questionCard.Hint,
				QuestionImageUrl: questionCard.QuestionImageUrl,
				Options: updatedOptions
			};

            const result = await questionSchema.safeParseAsync(model);
            if (!result.success) {
                console.log('client side validation error',result.error.flatten().fieldErrors);
                errors = Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || '']));
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

<Card.Root class="rounded-lg border p-4">
	<form
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2 py-4"
		onsubmit={(event) => { event.preventDefault(); handleSubmit(event); }}
	>
		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Id</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is id of Question.'} cls={'w-20'} />
			</div>
		</div>
		<Input bind:value={questionCard.id} class="hidden" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is title of Question.'} cls={'w-20'} />
			</div>
		</div>
		<Input bind:value={questionCard.Title} />
        <p class="error">{errors?.Title}</p>

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Description for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Description} />
        <p class="error">{errors?.Description}</p>

		<div class="mt-5 flex flex-col">
			<Label>Options<span class="text-red-600">*</span></Label>
			<Button
				type="button"
				onclick={addOption}
				class="mt-2 w-fit"
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

		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Response Type</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is ResponseType for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.ResponseType} class="hidden" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Score</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question Score for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Score} type="number" />
        <p class="error">{errors?.Score}</p>

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Hint</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question Hint for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Hint} />
        <p class="error">{errors?.Hint}</p>

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Correct Answer</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is CorrectAnswer for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.CorrectAnswer} />
        <p class="error">{errors?.CorrectAnswer}</p>

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Image Url</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question QuestionImageUrl for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />
        <p class="error">{errors?.QuestionImageUrl}</p>

		<Button type="submit" class="mx-auto mt-5 w-full">Add Question</Button>
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
