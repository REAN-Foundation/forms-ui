<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	import { page } from '$app/state';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { SectionEditorForm, Sidebar, FormHelper } from '$lib/index';
	import { measurements, cards } from '$lib/components/common/questionTypes';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import Sections from './components/Sections.svelte';
	import { dropzone } from '$lib/components/common/dnd';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { errorMessage } from '$lib/components/toast/message.utils';
	import { addToast } from '$lib/components/toast/toast.store';

	////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let typeOfQuestion: 'Basic' | 'Advanced' = $state('Basic');
	let uiSections = $state(data.templateInfo.FormSections[0].Subsections);

	const userId = $derived(page.params.userId);
	const parentFormTemplateId = $derived(page.params.templateId);
	const rootSectionId = data.templateInfo.FormSections[0].id;

	$effect(() => {
		uiSections = data.templateInfo.FormSections[0].Subsections;
	});

	function changeTypes(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.value === 'Basic' || target.value === 'Advanced') {
			typeOfQuestion = target.value;
		}
	}

	let showSheet = $state(false); // false;
	let questionCard = $state();
	let highlightedSection: number | null = $state();
	let highlightedSubSection: number | null = $state();
	let deleteButtonClicked = $state(false);
	let deleteSubButtonClicked = $state(false);
	let sectionForm = $state(false);
	let subSectionForm = $state(false);

	if (form) {
		showSheet = true;
		errorMessage('Unable to update form. Please try again.');
	}

	let cardToOpen;

	function openSheet(card) {
		showSheet = true;
		cardToOpen = card;
	}

	const handleDragAndDrop = async (dropData, event, sectionId = null, subsectionId = null) => {
		event.preventDefault();
		event.stopPropagation();

		console.log('dropData: ', dropData);
		console.log('sectionId: ', sectionId);
		console.log('subsectionId: ', subsectionId);
		console.log('parentFormTemplateId: ', parentFormTemplateId);
		if (sectionId === null && subsectionId === null) {
			// To create section in root section
			// Required data: parentFormTemplateId, parentSectionId that is rootSectionId
			if (dropData.type === 'section') {
				const response = await fetch(`/api/server/section`, {
					method: 'POST',
					body: JSON.stringify({
						parentFormTemplateId,
						parentSectionId: rootSectionId
					}),
					headers: { 'content-type': 'application/json' }
				});
				const sectionData = await response.json();
				toastMessage(sectionData);
				console.log('sectionData: ', sectionData);
			}
		}

		if (sectionId !== null && subsectionId === null) {
			if (dropData.type === 'card') {
				const model = {
					parentFormTemplateId,
					parentSectionId: sectionId,
					responseType: dropData.value
				};
				const response = await fetch(`/api/server/question`, {
					method: 'POST',
					body: JSON.stringify(model),
					headers: { 'content-type': 'application/json' }
				});
				const questionData = await response.json();
				toastMessage(questionData);
				console.log('questionData: ***', questionData);
			}

			if (dropData.type === 'section') {
				const response = await fetch(`/api/server/section`, {
					method: 'POST',
					body: JSON.stringify({
						parentFormTemplateId,
						parentSectionId: sectionId
					}),
					headers: { 'content-type': 'application/json' }
				});
				const sectionData = await response.json();
				toastMessage(sectionData);
				console.log('SubsectionData: ', sectionData);
			}
		}

		if (sectionId !== null && subsectionId !== null) {
			if (dropData.type === 'card') {
				const model = {
					parentFormTemplateId,
					parentSectionId: subsectionId,
					responseType: dropData.value
				};
				const response = await fetch(`/api/server/question`, {
					method: 'POST',
					body: JSON.stringify(model),
					headers: { 'content-type': 'application/json' }
				});
				const questionData = await response.json();
				toastMessage(questionData);
				console.log('questionData: ', questionData);
			}
		}
		await invalidate('app:allNodes');
	};

	const toastMessage = (response = null) => {
		if (!response) {
			addToast({
				message: 'Something went wrong',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		response?.HttpCode === 201 || response?.HttpCode === 200
			? addToast({
					message: response?.Message,
					type: 'success',
					timeout: 3000
				})
			: addToast({
					message: response?.Message,
					type: 'error',
					timeout: 3000
				});
	};

	function closeSheet(event?: any) {
		showSheet = false;
		invalidateAll();
	}

	function handleSubmitForm(event: { preventDefault: () => void }) {
		event.preventDefault();
		closeSheet(event);
	}

	async function handleDeleteCard(id: string, type: 'Section' | 'Card') {
		console.log('Inside parent handle delete card');
		console.log(id, type);
		switch (type) {
			case 'Section':
				try {
					const response = await fetch(`/api/server/section/${id}`, {
						method: 'DELETE'
					});

					const res = await response.json();
					console.log('res: ', res);
					toastMessage(res);
					invalidate('app:allNodes');
				} catch (error) {
					console.error('Error deleting section:', error);
					toastMessage();
					invalidate('app:allNodes');
				}
				break;

			case 'Card':
				try {
					const response = await fetch(`/api/server/question/${id}`, {
						method: 'DELETE'
					});
					const res = await response.json();
					console.log('res: ', res);
					toastMessage(res);
					invalidate('app:allNodes');
				} catch (error) {
					console.error('Error deleting card:', error);
					toastMessage();
					invalidate('app:allNodes');
				}
				break;

			default:
				toastMessage();
				break;
		}
	}

	let sectionToOpen = $state();
	async function openSectionForm(section) {
		sectionToOpen = section;
		sectionForm = true;
	}

	function closeSectionForm() {
		sectionForm = false;
	}

	function closeSubSectionForm() {
		subSectionForm = false;
	}
</script>


{#if sectionForm}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md"
	>
		<SectionEditorForm
			handleCancel={closeSectionForm}
			sectionData={sectionToOpen}
			data={data.sectionForm}
		/>

	</div>
{/if}
{#if showSheet}
	<FormHelper formDataForForm={data} {handleSubmitForm} {closeSheet} questionCard={cardToOpen} />
{/if}

<div class="bg-green-5 flex min-h-screen flex-row">
	<div class="flex flex-1 overflow-hidden">
		<Sidebar {typeOfQuestion} {changeTypes} {measurements} {cards} />
		<div class="mx-10 my-1 w-8/12 space-y-2 p-2">
			<div class="flex w-full flex-row items-center">
				<Breadcrumb.Root>
					<Breadcrumb.List class="flex">
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/users/{userId}/form-templates">Templates</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Page>Question</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
				<div class="ml-auto flex items-center">
					<Dialog.Root>
						<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })} flex">
							<!-- <Tooltip.Root>
								<Tooltip.Trigger>
									<Icon
										icon="icon-park-outline:preview-open"
										width="16"
										height="16"
										class="text-primary"
									/>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p>Preview</p>
								</Tooltip.Content>
							</Tooltip.Root> -->
						</Dialog.Trigger>
						<Dialog.Content class="dialog-content h-[90vh] overflow-y-auto sm:max-w-[150vh]">
							<!-- <Template {templateInfo} {sections} /> -->
							<p>assa</p>
						</Dialog.Content>
					</Dialog.Root>
				</div>
			</div>

			<div class="h-full w-full overflow-hidden">
				{#if uiSections.length === 0}
					<p class="text-center text-sm text-slate-500">
						Drag and drop sections, subsections, and question response type cards here
					</p>
				{/if}
				<div
					ondragover={(event) => {
						event.preventDefault();
					}}
					class="flex h-full w-full flex-col"
					use:dropzone={{ on_dropzone: handleDragAndDrop }}
					role="region"
					aria-label="Drop Area"
				>
					<!-- This componet is used to render all the sections/subsections/question cards -->
					<Sections
						bind:uiSections
						{handleDragAndDrop}
						{highlightedSection}
						{highlightedSubSection}
						{deleteButtonClicked}
						{deleteSubButtonClicked}
						{openSectionForm}
						{subSectionForm}
						{handleDeleteCard}
						{closeSheet}
						{openSheet}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.dialog-content.dialog-content) {
		scrollbar-width: none;
		-ms-overflow-style: none;
		overflow-y: scroll;
	}

	:global(.dialog-content.dialog-content::-webkit-scrollbar) {
		width: 0;
		height: 0;
		display: none;
	}
</style>
