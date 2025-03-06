<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { questionSchema, type QuestionSchema } from './question-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	// import { createEventDispatcher } from 'svelte';
	// import * as Accordion from '$lib/components/ui/accordion/index.js';

	import Option from './Option.svelte';
	import RangeRating from './RangeRating.svelte';
	import { enhance } from '$app/forms';
	import Icon from '@iconify/svelte';

	import * as Card from '$lib/components/ui/card/index.js';
	import InfoIcon from '../common/InfoIcon.svelte';
	import Question from '../preview/Question.svelte';
	//////////////////////////////////////////////////////////////////////////////

	// interface Props {
	// 	data: { form: SuperValidated<Infer<QuestionSchema>> };
	// 	responseType: string;
	// 	id: string;
	// 	questionCard: any; // Replace `any` with the correct type
	// 	handleSubmit();
	// }

	// Destructure props
	let { formDataForForm }: { data: { form: SuperValidated<Infer<QuestionSchema>> } } = $props();

console.log(formDataForForm.form.data,"This is data form editor");
	// Initialize superForm
	const form = superForm(formDataForForm.form, {
		validators: zodClient(questionSchema),
		applyAction: true,
		dataType: 'json'
	});



	const { form: formData } = form;

	// $effect(() => {
	// 	const form = formData as {
	// 		id?: string;
	// 		parentSectionId?: string;
	// 		title?: string;
	// 		description?: string;
	// 		responseType?: string;
	// 		options?: string[];
	// 		score?: number;
	// 		correctAnswer?: string;
	// 		hint?: string;
	// 		questionImageUrl?: string;
	// 		rangeMin?: number;
	// 		rangeMax?: number;
	// 	};

	// 	form.description = questionCard.Description;
	// 	form.title = questionCard.Title;
	// 	form.score = questionCard.Score;
	// 	form.correctAnswer = questionCard.CorrectAnswer;
	// 	form.hint = questionCard.Hint;
	// 	form.questionImageUrl = questionCard.QuestionImageUrl;
	// 	form.rangeMin = questionCard.RangeMin;
	// 	form.rangeMax = questionCard.RangeMax;
	// });

	let options = $state()
	options = formDataForForm.form.data.options ? [...formDataForForm.form.data.options] : [];

	const hardcodedImageUrl = 'https://example.com/default';

	function addOption() {
		if (formDataForForm.form.data.responseType === '"MultiChoiceSelection"' && options.length >= 2) return;
		options = [
			...options,
			{ Sequence: (options.length + 1).toString(), Data: '', ImageUrl: hardcodedImageUrl }
		];
		console.log(options);
	}

	function updateOption(index: number, key: string, value: string) {
		options[index] = { ...options[index], [key]: value };
		options = [...options];
	}

	function removeOption(index: number) {
		options = options.filter((_, i) => i !== index);
	}

	function submit(event: Event) {
		event.preventDefault();
		formData.options = options;
		// dispatch('handleSubmit', { formData });

	}

	const fields = {
		Range: RangeRating,
		Rating: RangeRating,
		SingleChoiceSelection: Option,
		MultiChoiceSelection: Option,
		Boolean: Option
	};
</script>

<Card.Root class="rounded-lg border p-4">
	<form
		action="?/createQuestion"
		method="post"
		use:enhance
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-5 py-4"
	>
		<Form.Field {form} name="id" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Id</Form.Label>
					<Input {...props} bind:value={$formData.id} />
				{/snippet}
			</Form.Control>
			<Form.Description>This is id of section.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label>Title <span class="text-red-600">*</span></Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question title.'} cls={'w-40'} />
						</div>
					</div>

					<Input {...props} bind:value={$formData.title} class="w-full" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your question title.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="responseType" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Type</Form.Label>
					<Input {...props} bind:value={$formData.responseType} class="w-full" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your question title.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label class=" ">Description</Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question description.'} cls={'w-40'} />
						</div>
					</div>
					<Input {...props} bind:value={$formData.description} class="w-full" />
				{/snippet}
				<!-- <input type="text" class="w-full" bind:value={desc} name="description"> -->
			</Form.Control>
			<!-- <Form.Description></Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<!-- {#if responseType === 'Range' || responseType === 'Rating'}
			<svelte:component this={fields[responseType]} {data} />
		{:else if responseType === 'SingleChoiceSelection' || responseType === 'MultiChoiceSelection' || responseType === 'Boolean'}
			<svelte:component this={fields[responseType]} option={questionCard.Options} />
		{:else if !responseType}
			<div class="text-center text-red-500">No type selected.</div>
		{/if} -->

		<!-- Options Section -->
		{#if formDataForForm.form.data.responseType === 'Range' || formDataForForm.form.data.responseType === 'Rating'}
			<!-- <svelte:component this={fields[formDataForForm.responseType]} {formDataForForm} /> -->
		{:else if formDataForForm.form.data.responseType === 'Boolean'}
			<div class="mt-4">
				<Button
					type="button"
					onclick={addOption}
					class="btn btn-primary mb-4"
					disabled={formDataForForm.responseType === 'Boolean' && options.length >= 2}
				>
					Add Option
				</Button>

				{#each options as option, index}
					<div class="mb-2 flex items-center">
						<Input
							type="text"
							name={`options[${index}].Sequence`}
							bind:value={option.Sequence}
							oninput={(e) => updateOption(index, 'Sequence', e.target.value)}
							placeholder={`Sequence of ${index + 1} Option`}
							class="mr-2 w-1/4"
						/>
						<Input
							type="text"
							name={`options[${index}].Data`}
							bind:value={option.Text}
							oninput={(e) => updateOption(index, 'Data', e.target.value)}
							placeholder={`Data for Option ${index + 1}`}
							class="mr-2 w-full"
						/>
						<Input
							type="hidden"
							name={`options[${index}].ImageUrl`}
							bind:value={option.ImageUrl}
							oninput={(e) => updateOption(index, 'ImageUrl', e.target.value)}
							placeholder={`Image URL (optional)`}
							class="w-1/4"
						/>
						<Button type="button" onclick={() => removeOption(index)} class="ml-2">
							<Icon icon="mingcute:delete-2-line" width="25" height="25" />
						</Button>
					</div>
				{/each}

				<input type="hidden" name="options" value={JSON.stringify(options)} />
			</div>
		{:else if formDataForForm.form.data.responseType === 'SingleChoiceSelection' || formDataForForm.form.data.responseType === 'MultiChoiceSelection'}

			<div class="mt-4">
				<Button type="button" onclick={addOption} class="btn btn-primary mb-4">Add Option</Button>

				{#each options as option, index}
					<div class="mb-2 flex items-center">
						<Input
							type="text"
							name={`options[${index}].Sequence`}
							bind:value={option.Sequence}
							oninput={(e) => updateOption(index, 'Sequence', e.target.value)}
							placeholder={`Sequence of ${index + 1} Option`}
							class="mr-2 w-1/4"
						/>
						<Input
							type="text"
							name={`options[${index}].Data`}
							bind:value={option.Text}
							oninput={(e) => updateOption(index, 'Data', e.target.value)}
							placeholder={`Data for Option ${index + 1}`}
							class="mr-2 w-full"
						/>
						<Input
							type="hidden"
							name={`options[${index}].ImageUrl`}
							bind:value={option.ImageUrl}
							oninput={(e) => updateOption(index, 'ImageUrl', e.target.value)}
							placeholder={`Image URL (optional)`}
							class="w-1/4"
						/>
						<Button type="button" onclick={() => removeOption(index)} class="ml-2">
							<Icon icon="mingcute:delete-2-line" width="25" height="25" />
						</Button>
					</div>
				{/each}

		
				<input type="hidden" name="options" value={JSON.stringify(options)} />
			</div>
		{/if}

		<!-- <Accordion.Root class="w-full ">
			<Accordion.Item value="item-1">
				<Accordion.Trigger>Score</Accordion.Trigger>
				<Accordion.Content
					><Form.Field {form} name="score">
						<Form.Control let:attrs>
							
							<Input {...attrs} bind:value={$formData.score} class="w-full" />
						</Form.Control>
						<Form.Description>This is the score for this question.</Form.Description>
						<Form.FieldErrors />
					</Form.Field></Accordion.Content
				>
			</Accordion.Item>

			<Accordion.Item value="item-2">
				<Accordion.Trigger>Correct Answer</Accordion.Trigger>
				<Accordion.Content>
					<Form.Field {form} name="correctAnswer">
						<Form.Control let:attrs>
						
							<Input {...attrs} bind:value={$formData.correctAnswer} class="w-full" />
						</Form.Control>
						<Form.Description>Correct answer for the question.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-3">
				<Accordion.Trigger>Hint</Accordion.Trigger>
				<Accordion.Content>
					<Form.Field {form} name="hint">
						<Form.Control let:attrs>
							
							<Input {...attrs} bind:value={$formData.hint} class="w-full" />
						</Form.Control>
						<Form.Description>Hint for this question.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-4">
				<Accordion.Trigger>Image</Accordion.Trigger>
				<Accordion.Content>
					<Form.Field {form} name="questionImageUrl">
						<Form.Control let:attrs>
						
							<Input
								{...attrs}
								bind:value={$formData.questionImageUrl}
								class="w-full"
								type="file"
							/>
						</Form.Control>
						<Form.Description>This is the image URL for the question.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root> -->

		<Form.Field {form} name="score">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label class=" ">Score</Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question score.'} cls={'w-40'} />
						</div>
					</div>
					<Input {...props} bind:value={$formData.score} class="w-full" />
				{/snippet}
				<!-- <input type="text" class="w-full" bind:value={desc} name="description"> -->
			</Form.Control>
			<!-- <Form.Description></Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="questionImageUrl">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label class=" ">Image</Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question questionImageUrl.'} cls={'w-40'} />
						</div>
					</div>
					<Input {...props} bind:value={$formData.questionImageUrl} class="w-full" />
				{/snippet}
				<!-- <input type="text" class="w-full" bind:value={desc} name="description"> -->
			</Form.Control>
			<!-- <Form.Description></Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="correctAnswer">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label class=" ">Correct Answer</Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question Correct Answer.'} cls={'w-40'} />
						</div>
					</div>
					<Input {...props} bind:value={$formData.correctAnswer} class="w-full" />
				{/snippet}
				<!-- <input type="text" class="w-full" bind:value={desc} name="description"> -->
			</Form.Control>
			<!-- <Form.Description></Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="hint">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label class=" ">Hint</Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question Hint.'} cls={'w-40'} />
						</div>
					</div>
					<Input {...props} bind:value={$formData.hint} class="w-full" />
				{/snippet}
				<!-- <input type="text" class="w-full" bind:value={desc} name="description"> -->
			</Form.Control>
			<!-- <Form.Description></Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

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
