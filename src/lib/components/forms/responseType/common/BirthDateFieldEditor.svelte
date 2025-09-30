<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import type { QuestionUpdateModel } from '../../../common/questionTypes';
	import { questionSchema } from '../../question-schema';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard = $bindable(), errors = $bindable(), handleQuestionCardUpdate } = $props();

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

<Card.Root class="rounded-none border-none bg-secondary p-4">
	<form
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2"
		onsubmit={(event) => {
			event.preventDefault();
			handleSubmit(event);
		}}
	>
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

		<!-- <div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Hint</Label>
		</div>
		<Input bind:value={questionCard.Hint} />
		<p class="text-destructive">{errors?.Hint}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11">CorrectAnswer</Label>
		</div>
		<Input bind:value={questionCard.CorrectAnswer} />
		<p class="text-destructive">{errors?.CorrectAnswer}</p> -->

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
