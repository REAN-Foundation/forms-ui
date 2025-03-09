<script lang="ts">
	import type { PageServerData } from './$types';

	import { page } from '$app/state';

	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Sidebar } from '$lib/index';

	import { measurements, cards } from '$lib/components/common/questionTypes';

	import {
		deleteSectionById,
		findSectionById,
		// findSectionByTitle,
		mapSectionsAndQuestions,
		updateSectionWithSubsection,
		type Section
	} from './components/localFunctions';
	import { createNewQuestion, createNewSection, deleteQuestion } from './components/apiFunctions';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import Sections from './components/Sections.svelte';
	import { dropzone } from '$lib/components/common/dnd';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let typeOfQuestion: 'Basic' | 'Advanced' = $state('Basic');

	let uiSections = $state(data.templateInfo.FormSections[0].Subsections);
	const userId = $derived(page.params.userId);
	const parentFormTemplateId = $derived(page.params.templateId);
	const rootSectionId = data.templateInfo.FormSections[0].id;

	// console.log(data.templateInfo.FormSections[0].id, 'this is id');
	// console.log(data.templateInfo.FormSections[0].Subsections, 'this is id');

	function changeTypes(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.value === 'Basic' || target.value === 'Advanced') {
			typeOfQuestion = target.value;
		}
	}

	//////////////////////////////////////////////////////////////////////

	let showSheet = $state(false); // false;
	let responseType = $state();
	let questionId = $state();
	let questionCard = $state();

	let sectionNameCounter = 1;
	let highlightedSection: number | null = $state();
	let highlightedSubSection: number | null = $state();
	let deleteButtonClicked = $state(false);
	let deleteSubButtonClicked = $state(false);
	// let cardToDelete: any = null;
	let sectionForm = $state(false);
	let subSectionForm = $state(false);
	let sectionDataFromDatabase = $state();
	let subSectionDataFromDatabase = $state();
	let parentSection = $state();

	async function handleDragAndDrop(
		dropData,
		event: { preventDefault: () => void; stopPropagation: () => void },
		sectionId: number = null,
		subsectionId: number = null
	) {
		event.preventDefault();
		event.stopPropagation();

		console.log(dropData, 'this is drop data');

		// Dynamically calculate the next IDs based on existing sections and cards
		// const getNextSectionId = () =>
		// 	Math.max(
		// 		0,
		// 		...uiSections.map((s) => s.localId),
		// 		...uiSections.flatMap((s) => s.subsections.map((sub) => sub.localId))
		// 	) + 1;

		// const getNextCardId = () => {
		// 	const nextId =
		// 		Math.max(
		// 			0,
		// 			...uiSections.flatMap((s) => s.cards.map((card) => Number(card.localId))),
		// 			...uiSections.flatMap((s) =>
		// 				s.subsections.flatMap((sub) => sub.cards.map((card) => Number(card.localId)))
		// 			)
		// 		) + 1;

		// 	return nextId;
		// };

		// let dropSectionData;

		// if (dropData.type === 'section') {
		// 	if (sectionId === null) {
		// 		dropSectionData = await getSectionData(parentFormTemplateId, data.assessmentTemplate[0].id);

		// 		const newSection = {
		// 			...dropData,
		// 			databaseId: dropSectionData.id,
		// 			localId: getNextSectionId(),
		// 			name: `Section ${sectionNameCounter++}`,
		// 			cards: [],
		// 			subsections: [],
		// 			subsectionCount: 0,
		// 			Title: dropSectionData.Title,
		// 			Description: dropSectionData.Description,
		// 			Sequence: dropSectionData.Sequence,
		// 			ParentSectionId: dropSectionData.ParentSectionId,
		// 			ParentFormTemplateId: dropSectionData.ParentFormTemplate.id
		// 		};
		// 		uiSections = [...uiSections, newSection];
		// 		toast.success('Section added successfully! Please add section details.');
		// 	} else{
		// 		// console.log("sectionId", sectionId);
		// 		// console.log(uiSections,"This is UI SECTION Array")
		// 		// Handling subsection addition
		// 		const parentSection = findSectionById(uiSections, sectionId);
		// 		// console.log("*****parentSection", parentSection);
		// 		if (parentSection) {
		// 			const newSubsectionId = await getSectionData(
		// 				parentFormTemplateId,
		// 				parentSection.databaseId
		// 			);
		// 			invalidateAll();
		// 			console.log(newSubsectionId, 'this is newSubsectionId====================');

		// 			const newSubsection = {
		// 				...dropData,
		// 				id: newSubsectionId.id,
		// 				localId: getNextSectionId(),
		// 				name: `Subsection ${parentSection.subsectionCount + 1}`,
		// 				cards: [],
		// 				subsections: [],
		// 				subsectionCount: 0
		// 			};
		// 			updateSectionWithSubsection(uiSections, sectionId, newSubsection);
		// 			parentSection.subsectionCount++;
		// 			uiSections = [...uiSections];
		// 			console.log('Updated UI Sections:', uiSections);

		// 			toast.success('Subsection added successfully! Please add subsection details.');
		// 		}
		// 	}
		// } else if (dropData.type === 'card') {
		// 	if (subsectionId !== null) {
		// 		const parentSection = findSectionById(uiSections, sectionId);
		// 		let subsection = parentSection?.subsections.find((sub) => sub.localId === subsectionId);

		// 		if (subsection && !subsection.cards.some((card) => card.localId === dropData.localId)) {
		// 			const questionId = await getQuestionData(
		// 				parentFormTemplateId,
		// 				subsection.id,
		// 				dropData.value
		// 			);

		// 			subsection.cards.push({
		// 				...dropData,
		// 				localId: Number(getNextCardId()),
		// 				tempId: String(getNextCardId()).padStart(4, '0'),
		// 				id: questionId.id,
		// 				Title: questionId.Title
		// 			});

		// 			subsection.cards.sort((a, b) => a.localId - b.localId);
		// 			subsection.cards = [...subsection.cards];
		// 			uiSections = [...uiSections];

		// 			console.log('Sorted subsection cards:', subsection.cards);
		// 			toast.success('Card added successfully! Please add card details.');
		// 		}
		// 	} else if (sectionId !== null) {
		// 		const section = findSectionById(uiSections, sectionId);
		// 		if (section && !section.cards.some((card) => card.localId === dropData.localId)) {
		// 			const questionId = await getQuestionData(
		// 				parentFormTemplateId,
		// 				section.databaseId,
		// 				dropData.value
		// 			);

		// 			// Append the new card to the end of the cards array
		// 			section.cards.push({
		// 				...dropData,
		// 				localId: Number(getNextCardId()),
		// 				tempId: String(getNextCardId()).padStart(4, '0'),
		// 				id: questionId.data.Data.id,
		// 				Title: questionId.data.Data.Title
		// 			});

		// 			// var sortableCards = section.cards.map((x) => {
		// 			// 	return {
		// 			// 		...x,
		// 			// 		tempId: String(x.localId).padStart(4, '0')
		// 			// 	};
		// 			// });
		// 			section.cards.sort((x, y) => {
		// 				if (x.tempId < y.tempId) return -1;
		// 				if (x.tempId > y.tempId) return 1;
		// 				return 0;
		// 			});
		// 			// section.cards = sortableCards;

		// 			console.log(section.cards, 'This is sorted card');
		// 			section.cards = [...section.cards];
		// 			console.log('Sorted section cards:', section.cards);

		// 			console.log(uiSections, 'this is uiSections');
		// 			toast.success('Card added successfully! Please add card details.');
		// 		}
		// 	}
		// }

		invalidateAll();
		highlightedSection = null;
		highlightedSubSection = null;
	}

	// function openSheet(e: { detail: { responseType: any; id: any; card: any } }) {
	// 	showSheet = true;
	// 	responseType = e.detail.responseType;
	// 	questionId = e.detail.id;
	// 	questionCard = e.detail.card;
	// }

	function closeSheet(event?: any) {
		showSheet = false;
		invalidateAll();
	}

	function handleSubmit(event: { preventDefault: () => void }) {
		event.preventDefault();
		closeSheet(event);
	}

	async function getSectionData(parentFormTemplateId: string, parentSectionId: string) {
		console.log(parentFormTemplateId, 'parentFormTemplateId');
		const sectionData = await createNewSection({ parentFormTemplateId, parentSectionId });
		console.log(sectionData, 'sectionData');
		return sectionData;
	}

	async function getQuestionData(
		parentFormTemplateId: string,
		parentSectionId: string,
		responseType: string
	) {
		const questionData = await createNewQuestion({
			parentFormTemplateId,
			parentSectionId,
			responseType
		});
		return questionData;
	}

	// function handleDragEnter(sectionId: number) {
	// 	highlightedSection = sectionId;
	// }

	// function handleDragLeave(sectionId: number) {
	// 	if (highlightedSection === sectionId) {
	// 		highlightedSection = null;
	// 	}
	// }

	// function handleDragOver(sectionId: number, event: DragEvent) {
	// 	event.preventDefault();
	// 	highlightedSection = sectionId;
	// }

	// function handleDragEnterSubsection(subSectionId: number) {
	// 	highlightedSubSection = subSectionId;
	// }

	// function handleDragLeaveSubsection(subSectionId: number) {
	// 	if (highlightedSubSection === subSectionId) {
	// 		highlightedSubSection = null;
	// 	}
	// }

	// function handleDragOverSubsection(subSectionId: number, event: DragEvent) {
	// 	event.preventDefault();
	// 	highlightedSubSection = subSectionId;
	// }

	// function openDeleteModal(card) {
	// 	deleteButtonClicked = true;
	// 	cardToDelete = card;
	// }

	// function closeDeleteModal() {
	// 	deleteButtonClicked = false;
	// 	cardToDelete = null;
	// }

	// function confirmDeleteCard(sectionLocalId: number, cardLocalId: number, cardId: string) {
	// 	handleDeleteCard(sectionLocalId, cardLocalId, cardId);
	// 	closeDeleteModal();
	// }

	function handleDeleteCard(questionId: string) {
		console.log(questionId, 'card to delete');
		// const section = findSectionById(uiSections, sectionId);
		// if (section) {
		// 	section.cards = section.cards.filter((card) => card.localId !== cardId);
		// 	uiSections = [...uiSections];
		// } else {
		// 	toast.error('Cannot find section. Try Again');
		// }
		handleQuestionDelete(questionId);
		deleteButtonClicked = !deleteButtonClicked;
		// toast.success('Question deleted successful');
	}

	const handleQuestionDelete = async (questionId: string) => {
		try {
			await deleteQuestion({ questionId: questionId });
			toast.success('Question deleted successfully');
		} catch (error) {
			console.error('Error deleting question:', error);
			toast.error('Failed to delete question. Please try again.');
		}
	};

	// function openDeleteSubModal({
	// 	sectionLocalId,
	// 	subsectionLocalId,
	// 	cardLocalId,
	// 	cardId,
	// 	isSubsection
	// }) {
	// 	deleteSubButtonClicked = true;
	// 	console.log('Deleting:', sectionLocalId, subsectionLocalId, cardLocalId, cardId, isSubsection);
	// 	cardToDelete = { sectionLocalId, subsectionLocalId, cardLocalId, cardId, isSubsection };
	// }

	// function closeDeleteSubModal() {
	// 	deleteSubButtonClicked = false;
	// 	cardToDelete = null;
	// }

	// function confirmDeleteSubcard(
	// 	sectionLocalId: number,
	// 	subsectionLocalId: number,
	// 	cardLocalId: number,
	// 	cardId: string
	// ) {
	// 	console.log(sectionLocalId, subsectionLocalId, cardLocalId, cardId);
	// 	handleDeleteSubcard(sectionLocalId, subsectionLocalId, cardLocalId, cardId);
	// 	closeDeleteModal();
	// }

	// function handleDeleteSubcard(
	// 	sectionId: number,
	// 	subsectionId: number,
	// 	subcardId: number,
	// 	subcardDatabaseId: string
	// ) {
	// 	console.log('Deleting subcard:', sectionId, subsectionId, subcardId, subcardDatabaseId);

	// 	const section = findSectionById(uiSections, sectionId);
	// 	if (section) {
	// 		const subsection = section.subsections.find((sub) => sub.localId === subsectionId);
	// 		if (subsection) {
	// 			subsection.cards = subsection.cards.filter((card) => card.localId !== subcardId); // Delete subcard from subsection
	// 			uiSections = [...uiSections]; // Update the UI
	// 		} else {
	// 			toast.error('Subsection not found.');
	// 		}
	// 	} else {
	// 		toast.error('Section not found.');
	// 	}

	// 	// Deleting the actual question related to the subcard (if applicable)
	// 	handleQuestionDelete(subcardDatabaseId);
	// 	deleteSubButtonClicked = !deleteSubButtonClicked;
	// 	// toast.success('Subcard deleted successfully');
	// }

	// const handleDeleteSectionById = async (localId: string) => {
	// 	try {
	// 		const res = await deleteSection({ sectionId: localId });
	// 		console.log('Delete successful:', res);
	// 	} catch (error) {
	// 		console.error('Error in handleDeleteSectionById:', error);
	// 	}
	// };

	// function handleDeleteSection(sectionId: number, databaseId: string) {
	// 	uiSections = deleteSectionById(uiSections, sectionId);
	// 	handleDeleteSectionById(databaseId);
	// 	toast.success('Section deleted successful');
	// }

	// function handleDeleteSubsection(subsectionId: number, sectionId: number, databaseId: string) {
	// 	uiSections = deleteSectionById(uiSections, subsectionId, true);
	// 	handleDeleteSectionById(databaseId);
	// 	toast.success('Subsection deleted successfully');
	// }

	// async function openSectionForm(id: string) {
	// 	sectionDataFromDatabase = await fetchSectionData(id);
	// 	sectionForm = true;
	// }

	function closeSectionForm() {
		sectionForm = false;
	}

	// async function openSubSectionForm(id: string, parentsectionId: string) {
	// 	subSectionDataFromDatabase = await fetchSectionData(id);
	// 	parentSection = parentsectionId;
	// 	subSectionForm = true;
	// }

	function closeSubSectionForm() {
		subSectionForm = false;
	}

	// function handleCardDragStart(sectionId: number, cardId: number, event: DragEvent) {
	// 	event.dataTransfer.setData('text/plain', JSON.stringify({ sectionId, cardId }));
	// }

	// function handleCardDrop(sectionId: number, cardIndex: number, event: DragEvent) {
	// 	event.preventDefault();

	// 	const data = JSON.parse(event.dataTransfer.getData('text/plain'));
	// 	const { sectionId: fromSectionId, cardId: fromCardId } = data;

	// 	// Find the source section and ensure we have a card to move
	// 	const fromSection = findSectionById(uiSections, fromSectionId);
	// 	if (fromSection) {
	// 		const fromIndex = fromSection.cards.findIndex((c) => c.localId === fromCardId);

	// 		// Find the target section and ensure it exists
	// 		const targetSection = findSectionById(uiSections, sectionId);
	// 		if (targetSection && fromIndex !== -1 && cardIndex !== -1) {
	// 			const [movedCard] = fromSection.cards.splice(fromIndex, 1);

	// 			// Insert the card into the target position in the same section
	// 			targetSection.cards.splice(cardIndex, 0, movedCard);

	// 			// Trigger UI update
	// 			uiSections = [...uiSections];
	// 		}
	// 	}
	// }

	// // Get all component names from formComponents
	// const componentKeys = Object.keys(formComponents);

	// // // Initialize selected component (default to first component in the list)
	// let selected = $state(componentKeys[0]);
</script>

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
					<Sections
						bind:uiSections
						{handleDragAndDrop}
						{highlightedSection}
						{highlightedSubSection}
						{showSheet}
						{deleteButtonClicked}
						{deleteSubButtonClicked}
						{sectionDataFromDatabase}
						{subSectionDataFromDatabase}
						{sectionForm}
						{subSectionForm}
						{handleDeleteCard}
						{handleQuestionDelete}
					/>
					<!-- {data}
						{responseType}
						{questionId}
						{questionCard}
						{parentSection}
						{closeSheet}
						{handleSubmit}
						{closeSectionForm}
						{closeSubSectionForm} -->
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
