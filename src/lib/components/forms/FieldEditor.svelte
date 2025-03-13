<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import InfoIcon from '../common/InfoIcon.svelte';
	import { Label } from '../ui/label';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard, closeModel } = $props();

	async function handleSubmit() {
		console.log(questionCard.Title);

		const model = {
			id: questionCard.id,
			title: questionCard.Title,
			description: questionCard.Description,
			responseType: questionCard.ResponseType,
			score: questionCard.Score,
			correctAnswer: questionCard.CorrectAnswer,
			hint: questionCard.Hint,
			questionImageUrl: questionCard.QuestionImageUrl
		};
		const response = await fetch(`/api/server/question`, {
			method: 'PUT',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		const question = await response.json();
		console.log(question);
		if (question.HttpCode === 200) {
			closeModel('Card', question);
		}
	}
	// console.log(form.title, 'this is form title');

	let options = $state([]);
	options = questionCard.options ? [...questionCard.options] : [];

	const hardcodedImageUrl = 'https://example.com/default';

	function addOption() {
		if (questionCard.responseType === '"MultiChoiceSelection"' && options.length >= 2) return;
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

	// function submit(event: Event) {
	// 	event.preventDefault();
	// 	formData.options = options;

	// 	// dispatch('handleSubmit', { formData });
	// }
</script>

<Card.Root class="rounded-lg border p-4">
	<form
		method="POST"
		use:enhance
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2 py-4"
		onsubmit={handleSubmit}
	>
		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
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
		<Input bind:value={questionCard.Title} required minlength="8" maxlength="256" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Description for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Description} />

		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Response Type<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is ResponseType for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.ResponseType} class="hidden" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Score<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question Score for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Score} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Hint<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question Hint for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Hint} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question CorrectAnswer<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is CorrectAnswer for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 "
				>Question QuestionImageUrl<span class="text-red-600">*</span></Label
			>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question QuestionImageUrl for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />

		<!-- <Form.Field {form} name="id" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Id</Form.Label>
					<Input {...props} bind:value={questionCard.id} />
				{/snippet}
			</Form.Control>
			<Form.Description>This is id of Question.</Form.Description>
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

					<Input
						{...props}
						bind:value={questionCard.Title}
						class="w-full"
						maxlength="100"
						minlength="8"
						required
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>This is your question title.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="responseType" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Type</Form.Label>
					<Input {...props} bind:value={questionCard.ResponseType} class="w-full" />
				{/snippet}
			</Form.Control>
			<Form.Description>This is your question title.</Form.Description>
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
					<Input {...props} bind:value={questionCard.Description} class="w-full" />
				{/snippet}
				<input type="text" class="w-full" bind:value={desc} name="description">
			</Form.Control>
			<Form.Description></Form.Description>
			<Form.FieldErrors />
		</Form.Field> -->

		<!-- {#if responseType === 'Range' || responseType === 'Rating'}
			<svelte:component this={fields[responseType]} {data} />
		{:else if responseType === 'SingleChoiceSelection' || responseType === 'MultiChoiceSelection' || responseType === 'Boolean'}
			<svelte:component this={fields[responseType]} option={questionCard.Options} />
		{:else if !responseType}
			<div class="text-center text-red-500">No type selected.</div>
		{/if} -->

		<!-- Options Section -->
		<!-- 	{#if questionCard.responseType === 'Range' || questionCard.responseType === 'Rating'}
			<svelte:component this={fields[formDataForForm.responseType]} {formDataForForm} />
		{:else if questionCard.responseType === 'Boolean'}
			<div class="mt-4">
				<Button
					type="button"
					onclick={addOption}
					class="btn btn-primary mb-4"
					disabled={questionCard.responseType === 'Boolean' && options.length >= 2}
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
		{:else if questionCard.responseType === 'SingleChoiceSelection' || questionCard.responseType === 'MultiChoiceSelection'}
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

		<Accordion.Root class="w-full ">
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
		<!-- 
		<Form.Field {form} name="score">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 flex flex-row gap-3">
						<Form.Label class=" ">Score</Form.Label>
						<div class="relative">
							<InfoIcon title={'This is your question score.'} cls={'w-40'} />
						</div>
					</div>
					<Input {...props} bind:value={questionCard.Score} class="w-full" />
				{/snippet}
				<input type="text" class="w-full" bind:value={desc} name="description">
			</Form.Control>
			<Form.Description></Form.Description>
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
					<Input {...props} bind:value={questionCard.QuestionImageUrl} class="w-full" />
				{/snippet}
				<input type="text" class="w-full" bind:value={desc} name="description">
			</Form.Control>
			<Form.Description></Form.Description>
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
					<Input {...props} bind:value={questionCard.CorrectAnswer} class="w-full" />
				{/snippet}
				<input type="text" class="w-full" bind:value={desc} name="description">
			</Form.Control>
			<Form.Description></Form.Description>
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
					<Input {...props} bind:value={questionCard.Hint} class="w-full" />
				{/snippet}
				<input type="text" class="w-full" bind:value={desc} name="description">
			</Form.Control>
			<Form.Description></Form.Description>
			<Form.FieldErrors />
		</Form.Field> -->

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
