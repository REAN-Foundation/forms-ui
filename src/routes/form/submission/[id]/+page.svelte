<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { createSchema, questionResponseModels, save, submit } from './apiFunctions';
	import QuestionPaper from '$lib/components/submission/QuestionPaper.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { invalidate } from '$app/navigation';
	import { cleanAssessmentTemplate } from '$lib/utils';
	import Icon from '@iconify/svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	const formSubmissionKey = $page.params.id;
	let section = $state(data.assessmentTemplate.FormSections[0].Subsections);
	let templateInfo = $state(data.assessmentTemplate);
	let answers = $state({});
	let errors = $state({});
	let formSubmissionId = data.submissionId;
	let questionResponseData = $derived(data.questionResponses);

	let submissionStatus = $derived(data.submissionStatus);
	let submittedOn = $state(data.submittedOn);
	let sections = cleanAssessmentTemplate(section);

	let isSubmitted = $state(false);

	// Derived value for formatted date
	let formattedSubmittedOn = $state('');
	$effect(() => {
		formattedSubmittedOn = submittedOn ? formatDate(submittedOn) : '';
	});

	function formatDate(submittedOn) {
		const date = new Date(submittedOn);
		return date.toLocaleString('en-IN', {
			dateStyle: 'long'
			// timeStyle: 'short'
		});
	}

	const responseTypeMap = {
		Integer: 'IntegerValue',
		Float: 'FloatValue',
		Boolean: 'BooleanValue',
		Text: 'TextValue',
		TextArray: 'TextValue',
		SingleChoiceSelection: 'TextValue',
		MultiChoiceSelection: 'TextValue',
		Object: 'TextValue',
		File: 'FileResourceId',
		Date: 'DateTimeValue',
		DateTime: 'DateTimeValue',
		Rating: 'IntegerValue',
		Location: 'DateTimeValue',
		Range: 'IntegerValue',
		Height: 'FloatValue',
		Weight: 'FloatValue',
		PulseRate: 'FloatValue',
		BloodPressure: 'TextValue',
		Temperature: 'FloatValue'
	};

	$effect(() => {
		if (submissionStatus === 'Submitted') {
			isSubmitted = true;
			$inspect('Ia am dialog', isSubmitted);
		}
		answers = Object.fromEntries(
			(questionResponseData ?? []).map((item) => {
				const responseTypeKey = responseTypeMap[item.Question.ResponseType] || 'TextValue';
				return [item.Question.id, item[responseTypeKey] ?? null];
			})
		);
	});

	async function handleSave(e, showToast = true) {
		e.preventDefault();

		const schema = createSchema(sections);

		const validationResult = schema.safeParse(answers);

		console.log('validationResult: ', validationResult);

		if (!validationResult.success) {
			errors = Object.fromEntries(
				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			addToast({
				message: 'Please fill in all required fields before saving.',
				type: 'error',
				timeout: 3000
			});
			return false;
		}
		errors = {};

		try {
			const questionResponses = await questionResponseModels(
				sections,
				answers,
				formSubmissionId,
				questionResponseData
			);
			const url = `/api/server/question-response`;
			const headers = { 'Content-Type': 'application/json' };
			const res = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					questionResponses: questionResponses,
					formSubmissionKey: formSubmissionKey
				}),
				headers
			});

			const saveData = await res.json();
			if (showToast) {
				toastMessage(saveData);
			}
			invalidate('app:allNodes');
			console.log('saveData: ', saveData);
			return true;
		} catch (error) {
			console.error('Error saving data:', error);
			addToast({
				message: 'Save failed. Please try again.',
				type: 'error',
				timeout: 3000
			});
			return false;
		}
	}

	async function handleSubmit() {
		try {
			const saveSuccess = await handleSave(new Event('submit'), false);
			if (!saveSuccess) return;

			const url = `/api/server/submit`;
			const headers = { 'Content-Type': 'application/json' };
			const res = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({ submissionKey: formSubmissionKey }),
				headers
			});

			const submissionData = await res.json();
			toastMessage(submissionData);
			invalidate('app:allNodes');
			console.log('submissionData: ', submissionData);
		} catch (error) {
			console.error('Error during submission:', error);
			addToast({
				message: 'Submission failed. Please try again.',
				type: 'error',
				timeout: 3000
			});
		}
	}
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

	<div class="mx-auto my-10 flex h-screen w-full rounded-sm p-1">
		<form onsubmit={handleSave} class="mx-auto w-full">
			<div class="">
				<!-- this is the completed filled form -->

				{#if isSubmitted}
					<Alert.Root variant="primary">
						<Icon icon="ooui:success" class="h-4 w-4" color="white" />
						<Alert.Description>
							This form has already been submitted!
							<!-- <strong>{formattedSubmittedOn}</strong>. -->
						</Alert.Description>
					</Alert.Root>
				{/if}
			</div>

			<div
				class="mx-auto my-10 w-full rounded-md border border-gray-400 p-5 dark:bg-[#0a0a0b] md:w-3/4"
			>
				{#if templateInfo}
					<div
						class=" relative mx-auto h-fit rounded-md border border-gray-400 py-4 dark:bg-[#0a0a0b]"
					>
						<div>
							<!-- <p class="absolute right-4 top-2 mr-0 mt-0 leading-7 [&:not(:first-child)]:mt-6">
								{templateInfo.Type}
							</p> -->
							<div class="flex h-full flex-col items-center justify-center">
								<h2 class="text-center text-2xl font-bold capitalize">
									{templateInfo.Title}
								</h2>
								<div class="relative w-full p-4">
									<p class="flex w-full justify-center text-center text-gray-700">
										{templateInfo.Description}
									</p>
									<span class="absolute mx-4 right-0 top-1/2 -translate-y-1/2 text-sm text-gray-700">
										Version: {templateInfo.CurrentVersion}
									</span>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<div class=" mt-3 rounded-md  border-gray-400  dark:bg-[#0a0a0b]">
					<QuestionPaper {sections} bind:answers bind:errors {isSubmitted} />
				</div>
				<div class="flex flex-col my-2 gap-3 sm:flex-row sm:space-x-4">
					<Button type="submit" variant="outline" class="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300" disabled={isSubmitted}
						>Save</Button
					>
					<Button
						onclick={handleSubmit}
						type="button"
						variant="ghost"
						class="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-sm focus:outline-none"
						disabled={isSubmitted}>Submit</Button
					>
				</div>
			</div>
		</form>
	</div>
</div>
