<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { save, submit } from './apiFunctions';

	let { data }: { data: PageServerData } = $props();
	console.log('sections');
	$inspect(data.assessmentTemplate);
	let sections = $state(data.assessmentTemplate.FormSections[0].Subsections);
	let templateInfo = $state(data.assessmentTemplate);
	// const questions = data.assessmentTemplate.Questions;

	let answers = $state({});
	let currentIndex = $state(0); // Used for pagination
	let isCollapsed = $state(false);
	// let displayQuestions = $state([]);

	// // Display option from backend (e.g., OneQuestion, FiveQuestions, etc.)
	// let displayOption = templateInfo.ItemsPerPage;

	// // Sort sections based on Sequence (A1, A2, A3...)
	// const sortedSections = sections.sort((a, b) =>
	// 	(a.Sequence || '').localeCompare(b.Sequence || '')
	// );

	// // Group questions by their ParentFormSection (section)
	// const questionsBySection = sortedSections.map((section) => ({
	// 	section,
	// 	questions: questions
	// 		.filter((q) => q.ParentFormSection?.id === section.id)
	// 		.sort((a, b) => (a.Sequence || '').localeCompare(b.Sequence || ''))
	// }));

	// // Flatten questions across sections, maintaining sequence order
	// const allQuestionsInOrder = questionsBySection.flatMap((group) => group.questions);

	// // Get the total number of questions
	// const totalQuestions = allQuestionsInOrder.length;

	// // Helper function to get current questions based on ItemsPerPage
	// function getCurrentQuestions(index: number) {
	// 	switch (displayOption) {
	// 		case 'OneQuestion':
	// 			return [allQuestionsInOrder[index]]; // Show one question at a time
	// 		case 'FiveQuestions':
	// 			return allQuestionsInOrder.slice(index, index + 5); // Show 5 questions
	// 		case 'TenQuestions':
	// 			return allQuestionsInOrder.slice(index, index + 10); // Show 10 questions
	// 		case 'AllQuestions':
	// 		default:
	// 			return allQuestionsInOrder; // Show all questions at once
	// 	}
	// }

	// // Reactive variable that holds the questions currently being displayed
	// displayQuestions = getCurrentQuestions(currentIndex);
	// // $: console.log('displayQuestions:', displayQuestions);

	// // Determine the max index for pagination based on ItemsPerPage
	// function getMaxIndex() {
	// 	switch (displayOption) {
	// 		case 'OneQuestion':
	// 			return totalQuestions - 1;
	// 		case 'FiveQuestions':
	// 			return Math.max(0, totalQuestions - 5);
	// 		case 'TenQuestions':
	// 			return Math.max(0, totalQuestions - 10);
	// 		case 'AllQuestions':
	// 		default:
	// 			return 0;
	// 	}
	// }

	// // Handle next page (or question)
	// function nextPage() {
	// 	const maxIndex = getMaxIndex();
	// 	if (currentIndex < maxIndex) {
	// 		currentIndex = Math.min(currentIndex + getStep(), maxIndex);
	// 	}
	// 	console.log('Next page clicked. New currentIndex:', currentIndex);
	// }

	// // Handle previous page (or question)
	// function prevPage() {
	// 	if (currentIndex > 0) {
	// 		currentIndex = Math.max(currentIndex - getStep(), 0);
	// 	}
	// 	console.log('Previous page clicked. New currentIndex:', currentIndex);
	// }

	// // Get the step for pagination based on ItemsPerPage setting
	// function getStep() {
	// 	switch (displayOption) {
	// 		case 'OneQuestion':
	// 			return 1;
	// 		case 'FiveQuestions':
	// 			return 5;
	// 		case 'TenQuestions':
	// 			return 10;
	// 		default:
	// 			return 1;
	// 	}
	// }

	// Toggle the sidebar's collapsed state
	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}

	// Save the current answers to the backend
	function handleSave(event) {
		event.preventDefault();
		const FormSubmissionId = $page.params.id;
		save({ Data: answers, FormSubmissionId: FormSubmissionId });
	}

	// Submit the form to the backend
	function handleSubmit() {
		const FormSubmissionId = $page.params.id;
		submit(FormSubmissionId);
	}

	const componentsMap = {
		Text: Text,
		Float: FloatInteger,
		Integer: FloatInteger,
		Boolean: Bool,
		Object: Text,
		TextArray: Text,
		File: File,
		SingleChoiceSelection: SingleChoice,
		MultiChoiceSelection: MultipleChoices,
		Date: DateTime,
		DateTime: DateTime,
		Rating: Rating,
		Range: Range,
		Temperature: BloodOxygen,
		BloodPressure: BloodOxygen,
		Glucose: BloodOxygen,
		BloodOxygenSaturation: BloodOxygen,
		PulseRate: BloodOxygen,
		Hematocrit: BloodOxygen,
		Cholesterol: BloodOxygen,
		Weight: BloodOxygen,
		Height: BloodOxygen,
		RespiratoryRate: BloodOxygen,
		Electrolytes: BloodOxygen,
		KidneyFunction: BloodOxygen,
		Lipoprotein: BloodOxygen,
		CReactiveProtein: BloodOxygen,
		Sleep: BloodOxygen,
		HemoglobinA1C: BloodOxygen,
		WaistCircumference: BloodOxygen
	};

	import FloatInteger from '$lib/components/submission/FloatInteger.svelte';
	import SingleChoice from '$lib/components/submission/SingleChoice.svelte';
	import Text from '$lib/components/submission/Text.svelte';
	import File from '$lib/components/submission/File.svelte';
	import MultipleChoices from '$lib/components/submission/MultipleChoice.svelte';
	import DateTime from '$lib/components/submission/Datetime.svelte';
	import Bool from '$lib/components/submission/Boolean.svelte';
	import Range from '$lib/components/submission/Range.svelte';
	import Rating from '$lib/components/submission/Rating.svelte';
	import BloodOxygen from '$lib/components/submission/BloodOxygen.svelte';
</script>

<div class="flex flex-row">
	<!-- Collapsible Sidebar -->
	<!-- <p>Display Option: {displayOption}</p> -->
	<!-- <div
		class={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-1/5'} border p-2`}
	>
		<Button onclick={toggleSidebar} variant="ghost" class="mb-4 w-full p-2">
			{isCollapsed ? 'Open' : 'Close'}
		</Button>
		{#if !isCollapsed}
		{/if}
	</div> -->

	<div class="mx-auto flex h-screen w-[80%] rounded-sm p-1">
		<form action="?/response" method="post" onsubmit={handleSave} class="mx-auto w-[80%] space-y-3">
			<div class="relative mx-auto h-fit rounded-md border border-gray-500 pb-7 pt-5">
				{#if templateInfo}
					<div>
						<p class="absolute right-2 top-2 mr-0 mt-0 leading-7 [&:not(:first-child)]:mt-6">
							{templateInfo.Type}
						</p>
						<div class="flex h-full flex-col items-center justify-center">
							<h2
								class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
							>
								{templateInfo.Title}
							</h2>
							<div class="mt-2 flex w-full flex-row items-center justify-center">
								<p class="mx-auto [&:not(:first-child)]:mt-6">
									{templateInfo.Description}
								</p>
								<p class="ml-auto mr-2 text-sm">
									Version: {templateInfo.CurrentVersion}
								</p>
							</div>
							<!-- <span class="ml-auto mr-2 text-sm">Total Questions: {questions.length}</span> -->
						</div>
					</div>
				{/if}
			</div>

			<div class="min-h-[390px]">
				{#each sections ?? [] as s}
					<div class="mb-4 min-h-[300px] border p-5">
						<h4 class="text-md font-semibold">
							Section: {s.Title || 'Untitled Section'}
						</h4>
						<p class="text-sm text-gray-600">
							{s.Description || 'No description provided.'}
						</p>

						{#each s?.Questions ?? [] as sq, index}
							<div class="mt-2 border p-3">
								<svelte:component this={componentsMap[sq.ResponseType]} q={sq} bind:answers />
							</div>
						{/each}

						<div class=" p-5">
							{#each s?.Subsections ?? [] as ss}
								<h4 class="text-md mt-5 font-semibold">
									Sub Section: {ss.Title || 'Untitled Sub Section'}
								</h4>
								<p class="text-sm text-gray-600">
									{ss.Description || 'No description provided.'}
								</p>

								{#each ss?.Questions ?? [] as ssq, index}
									<div class="mt-2 border p-3">
										<svelte:component this={componentsMap[ssq.ResponseType]} q={ssq} bind:answers />
									</div>
								{/each}
							{/each}
						</div>
					</div>
				{/each}

				<!-- {#if displayOption === 'OneQuestion'}
					{#each displayQuestions as question (question.id)}
						<div class="mb-4 min-h-[300px]">
							<h4 class="text-md font-semibold">
								Section: {question.ParentFormSection.Title || 'Untitled Section'}
							</h4>
							<p class="text-sm text-gray-600">
								{question.ParentFormSection.Description || 'No description provided.'}
							</p>
					
							<div class="mt-2">
								<svelte:component
									this={componentsMap[question.ResponseType]}
									q={question}
									bind:answers
								/>
							</div>
						</div>
					{/each}
				{:else if displayOption === 'OneSection'}
					{#each sections as section}
					{#if section.Title !== 'Assessment Root Section'}
						<h4 class="text-md font-semibold">
							Section: {section.Title || 'Untitled Section'}
						</h4>
						<p class="text-sm text-gray-600">
							{section.Description || 'No description provided.'}
						</p>
						{#each displayQuestions as question (question.id)}
							{#if section.id === question.ParentFormSection.id && section.Title !== 'Assessment Root Section'}
								<div class="mb-4 min-h-[100px]">
							
									<div class="mt-2">
										<svelte:component
											this={componentsMap[question.ResponseType]}
											q={question}
											bind:answers
										/>
									</div>
								</div>
							{/if}
						{/each}
						{/if}
					{/each}
				{/if} -->
			</div>

			<!-- <div class="flex justify-between">
				<Button type="button" on:click={prevPage} variant="outline" disabled={currentIndex === 0}>
					Previous
				</Button>
				
			</div> -->

			<!-- <div class="flex justify-between space-x-2 p-4">
				<Button type="button" onclick={prevPage} variant="outline" disabled={currentIndex === 0}>
					Previous
				</Button>
				<span>Question {currentIndex + 1} of {totalQuestions}</span>
				<Button
					type="button"
					onclick={nextPage}
					variant="outline"
					disabled={currentIndex >= totalQuestions - getStep()}
				>
					Next
				</Button>
			</div> -->
			<div class="mx-auto mt-2 flex flex-col space-x-5 md:flex-row">
				<Button type="submit" variant="outline" class="w-full">Save</Button>
				<Button onclick={handleSubmit} type="button" variant="secondary" class="btn h-10 w-full"
					>Submit</Button
				>
			</div>
		</form>
	</div>
</div>
