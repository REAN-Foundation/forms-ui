<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import InfoIcon from '$lib/components/common/InfoIcon.svelte';
	// import InfoIcon from '';
	// import { Label } from '../ui/label';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard } = $props();

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
			questionImageUrl: questionCard.QuestionImageUrl,
			IsRequired: questionCard.IsRequired
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
</script>

<Card.Root class="rounded-lg border p-4">
	<form
		method="POST"
		use:enhance
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2 py-4"
		onsubmit={handleSubmit}
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

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Description for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Description} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<div class="col-span-11 space-x-2">
				<Label for="isRequired">Is Required</Label>
				<input
					id="isRequired"
					type="checkbox"
					bind:checked={questionCard.IsRequired}
					aria-labelledby="isRequired"
					class="h-5 w-5"
				/>
			</div>
			<div class="relative col-span-1">
				<InfoIcon title={'This is title of Question.'} cls={'w-20'} />
			</div>
		</div>
		<p class="error">{errors?.IsRequired}</p>

		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Response Type</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is ResponseType for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.ResponseType} class="hidden" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Score</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question Score for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Score} type="number" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Hint</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question Hint for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.Hint} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question CorrectAnswer</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is CorrectAnswer for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question QuestionImageUrl</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Question QuestionImageUrl for Question.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />

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
