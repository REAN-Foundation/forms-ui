<script lang="ts">
	import { dropzone } from '../../../../../../../lib/components/common/dnd';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Icon from '@iconify/svelte';
	import { formComponents } from './response.types/index';
	import { goto } from '$app/navigation';
	import { deleteSectionById, findSectionById } from './localFunctions';
	import { toast } from 'svelte-sonner';
	import { deleteSection, fetchSectionData } from './apiFunctions';
	import { DragAndDropFunctionality } from '$lib';
	import { page } from '$app/state';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	////////////////////////////////////////////////////////////////////////////

	let {
		uiSections = $bindable(),
		data,
		highlightedSection,
		highlightedSubSection,
		showSheet = $bindable(),
		responseType,
		questionId,
		questionCard,
		deleteButtonClicked,
		deleteSubButtonClicked,
		sectionDataFromDatabase,
		subSectionDataFromDatabase,
		sectionForm,
		subSectionForm,
		parentSection,

		handleDeleteCard,
		handleQuestionDelete,
		handleDragAndDrop,
		closeSheet,
		handleSubmit,
		closeSectionForm,
		closeSubSectionForm
	} = $props();

	const templateId = $derived(page.params.templateId);
	const userId = $derived(page.params.userId);

	// Initialize selected component (default to first component in the list)
	const componentKeys = Object.keys(formComponents);
	let selected = $state(componentKeys[0]);
	let cardToDelete: any = null;

	function openSheet(e: { detail: { responseType: any; id: any; card: any } }) {
		showSheet = true;
		responseType = e.detail.responseType;
		questionId = e.detail.id;
		questionCard = e.detail.card;
	}

	function handleDragEnter(sectionId: number) {
		highlightedSection = sectionId;
	}

	function handleDragLeave(sectionId: number) {
		if (highlightedSection === sectionId) {
			highlightedSection = null;
		}
	}

	function handleDragOver(sectionId: number, event: DragEvent) {
		event.preventDefault();
		highlightedSection = sectionId;
	}

	function handleDragEnterSubsection(subSectionId: number) {
		highlightedSubSection = subSectionId;
	}

	function handleDragLeaveSubsection(subSectionId: number) {
		if (highlightedSubSection === subSectionId) {
			highlightedSubSection = null;
		}
	}

	function handleDragOverSubsection(subSectionId: number, event: DragEvent) {
		event.preventDefault();
		highlightedSubSection = subSectionId;
	}

	function openDeleteModal(card) {
		deleteButtonClicked = true;
		cardToDelete = card;
	}
	function closeDeleteModal() {
		deleteButtonClicked = false;
		cardToDelete = null;
	}
	function confirmDeleteCard(sectionLocalId: number, cardLocalId: number, cardId: string) {
		handleDeleteCard(sectionLocalId, cardLocalId, cardId);
		closeDeleteModal();
	}

	function openDeleteSubModal({
		sectionLocalId,
		subsectionLocalId,
		cardLocalId,
		cardId,
		isSubsection
	}) {
		deleteSubButtonClicked = true;
		console.log('Deleting:', sectionLocalId, subsectionLocalId, cardLocalId, cardId, isSubsection);
		cardToDelete = { sectionLocalId, subsectionLocalId, cardLocalId, cardId, isSubsection };
	}

	function closeDeleteSubModal() {
		deleteSubButtonClicked = false;
		cardToDelete = null;
	}

	function confirmDeleteSubcard(
		sectionLocalId: number,
		subsectionLocalId: number,
		cardLocalId: number,
		cardId: string
	) {
		console.log(sectionLocalId, subsectionLocalId, cardLocalId, cardId);
		handleDeleteSubcard(sectionLocalId, subsectionLocalId, cardLocalId, cardId);
		closeDeleteModal();
	}

	function handleDeleteSubcard(
		sectionId: number,
		subsectionId: number,
		subcardId: number,
		subcardDatabaseId: string
	) {
		console.log('Deleting subcard:', sectionId, subsectionId, subcardId, subcardDatabaseId);

		const section = findSectionById(uiSections, sectionId);
		if (section) {
			const subsection = section.subsections.find((sub) => sub.localId === subsectionId);
			if (subsection) {
				subsection.cards = subsection.cards.filter((card) => card.localId !== subcardId); // Delete subcard from subsection
				uiSections = [...uiSections]; // Update the UI
			} else {
				toast.error('Subsection not found.');
			}
		} else {
			toast.error('Section not found.');
		}

		// Deleting the actual question related to the subcard (if applicable)
		handleQuestionDelete(subcardDatabaseId);
		deleteSubButtonClicked = !deleteSubButtonClicked;
		// toast.success('Subcard deleted successfully');
	}
	const handleDeleteSectionById = async (localId: string) => {
		try {
			const res = await deleteSection({ sectionId: localId });
			console.log('Delete successful:', res);
		} catch (error) {
			console.error('Error in handleDeleteSectionById:', error);
		}
	};

	function handleDeleteSection(sectionId: number, databaseId: string) {
		uiSections = deleteSectionById(uiSections, sectionId);
		handleDeleteSectionById(databaseId);
		toast.success('Section deleted successful');
	}

	function handleDeleteSubsection(subsectionId: number, sectionId: number, databaseId: string) {
		uiSections = deleteSectionById(uiSections, subsectionId, true);
		handleDeleteSectionById(databaseId);
		toast.success('Subsection deleted successfully');
	}

	async function openSectionForm(id: string) {
		sectionDataFromDatabase = await fetchSectionData(id);
		sectionForm = true;
	}

	async function openSubSectionForm(id: string, parentsectionId: string) {
		subSectionDataFromDatabase = await fetchSectionData(id);
		parentSection = parentsectionId;
		subSectionForm = true;
	}

	function handleCardDragStart(sectionId: number, cardId: number, event: DragEvent) {
		event.dataTransfer.setData('text/plain', JSON.stringify({ sectionId, cardId }));
	}

	function handleCardDrop(sectionId: number, cardIndex: number, event: DragEvent) {
		event.preventDefault();

		const data = JSON.parse(event.dataTransfer.getData('text/plain'));
		const { sectionId: fromSectionId, cardId: fromCardId } = data;

		// Find the source section and ensure we have a card to move
		const fromSection = findSectionById(uiSections, fromSectionId);
		if (fromSection) {
			const fromIndex = fromSection.cards.findIndex((c) => c.localId === fromCardId);

			// Find the target section and ensure it exists
			const targetSection = findSectionById(uiSections, sectionId);
			if (targetSection && fromIndex !== -1 && cardIndex !== -1) {
				const [movedCard] = fromSection.cards.splice(fromIndex, 1);

				// Insert the card into the target position in the same section
				targetSection.cards.splice(cardIndex, 0, movedCard);

				// Trigger UI update
				uiSections = [...uiSections];
			}
		}
	}

	function sectionEditRoute(id) {
		goto(`/users/${userId}/form-templates/${templateId}/forms/${id}/edit`);
	}
	// const route = `/users/${userId}/form-templates/${templateId}/forms/${section.databaseId}/edit`;
	// const editRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/edit`;
</script>

{#if showSheet}
	<DragAndDropFunctionality
		{data}
		{responseType}
		id={questionId}
		{questionCard}
		{closeSheet}
		handleSubmitForm={handleSubmit}
	/>
{/if}
{#each uiSections as section (section.localId)}
	<div
		class="my-4 border p-3 {highlightedSection === section.localId ? 'highlight' : ''}"
		ondragenter={() => handleDragEnter(section.localId)}
		ondragleave={() => handleDragLeave(section.localId)}
		ondragover={(event) => handleDragOver(section.localId, event)}
		use:dropzone={{
			on_dropzone: (data, e) => handleDragAndDrop(data, e, section.localId)
		}}
		role="region"
		aria-label={`Section ${section.name}`}
	>
		<Collapsible.Root class=" space-y-2">
			<div class="flex flex-row">
				<div class="flex items-center justify-between space-x-4 px-4">
					<Collapsible.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'w-9 p-0' })}
					>
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Button variant="ghost" size="sm" class="w-9 p-0">
										<Icon icon="fluent:chevron-up-down-24-regular" width="16" height="16" />

										<span class="sr-only">Toggle</span>
									</Button>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p>Collaps to see</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</Collapsible.Trigger>
				</div>

				<div class="flex h-full w-full flex-row">
					<Button
						variant="outline"
						class="h-full w-full p-2"
						onclick={() => sectionEditRoute(section.databaseId)}
					>
						<div class="flex-col">
							{section.Title || section.name}
							<p class="text-sm text-gray-300 dark:text-gray-500">
								Drop the Subsection and response type cards here
							</p>
						</div>
					</Button>

					<AlertDialog.Root>
						<AlertDialog.Trigger class="{buttonVariants({ variant: 'outline' })} bg-red400">
							<Button variant="ghost" class="ml-1 h-full w-full "
								><Icon icon="weui:delete-outlined" width="20" height="20" style="color:red" />
							</Button>
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. This will permanently delete your Section and remove
									your data from our servers. please be certain.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									class="bg-destructive hover:bg-destructive dark:text-white"
									onclick={() => handleDeleteSection(section.localId, section.databaseId)}
									>Delete</AlertDialog.Action
								>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</div>
			<Collapsible.Content class="space-y-2">
				<div class="h-fit w-full p-1" role="list" aria-label={`Cards in section: ${section.name}`}>
					{#if section.cards.length === 0}
						<p class="text-center text-sm text-slate-500">Drop response type cards here</p>
					{/if}

					<!-- {#each [...section.cards].sort((a, b) => a.localId - b.localId) as card, index (card.localId)} -->
					{#each section.cards as card, index (card.localId)}
						<div
							class="hover-container items-center justify-between"
							draggable="true"
							ondragstart={(event) => handleCardDragStart(section.localId, card.localId, event)}
							ondrop={(event) => handleCardDrop(section.localId, index, event)}
							ondragover={(event) => {
								event.preventDefault();
							}}
							role="listitem"
							aria-label={`Card: ${card.name}`}
						>
							<div class="relative mt-1 flex w-[95%]">
								{#if card.name !== 'None'}
									<svelte:component
										this={formComponents[card.name]}
										responseType={selected}
										id={card.id}
										{card}
									/>
									<!-- <select bind:value={selected}>
										{#each componentKeys as key}
											<option value={key}>{key}</option>
										{/each}
									</select> -->

									<!-- 							
										{@const SelectedComponent = formComponents[selected]}
										<SelectedComponent
											open={(temp: { detail: { responseType: any; id: any; card: any } }) =>
												openSheet(temp)}
											close={(temp: any) => closeSheet(temp)}
											submit={(temp: { preventDefault: () => void }) => handleSubmit(temp)}
											responseType={selected}
											id={card.id}
											{card}
										/> -->
								{/if}
								<button
									class="delete-button"
									onclick={() =>
										openDeleteModal({
											sectionLocalId: section.localId,
											cardLocalId: card.localId,
											cardId: card.id
										})}
									aria-label="Delete card"
								>
									<Icon icon="weui:delete-outlined" width="18" height="18" style="color: red" />
								</button>
							</div>
						</div>
					{/each}

					{#if deleteButtonClicked}
						<div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"></div>

						<div class="fixed inset-0 z-50 flex items-center justify-center">
							<div
								class="relative z-50 w-full max-w-lg border bg-background p-6 shadow-lg sm:rounded-lg md:w-full"
							>
								<div class="flex flex-col space-y-2 text-center sm:text-left">
									<h1 class="text-lg font-semibold">Are you absolutely sure?</h1>
									<p class="text-sm text-muted-foreground">
										This action cannot be undone. This will permanently delete your question and
										remove your data from our servers.
									</p>
								</div>

								<div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
									<Button variant="outline" onclick={closeDeleteModal}>Cancel</Button>
									<Button
										class="bg-destructive hover:bg-destructive dark:text-white"
										onclick={() =>
											confirmDeleteCard(
												cardToDelete.sectionLocalId,
												cardToDelete.cardLocalId,
												cardToDelete.cardId
											)}
									>
										Delete
									</Button>
								</div>
							</div>
						</div>
					{/if}
				</div>

				{#if section.subsections.length > 0}
					{#each section.subsections as subsection (subsection.localId)}
						<div
							class="my-2 h-fit w-full p-1 {highlightedSubSection === subsection.localId
								? 'highlight'
								: ''} "
							ondragenter={() => handleDragEnterSubsection(subsection.localId)}
							ondragleave={() => handleDragLeaveSubsection(subsection.localId)}
							ondragover={(event) => handleDragOverSubsection(subsection.localId, event)}
							use:dropzone={{
								on_dropzone: (data, e) =>
									handleDragAndDrop(data, e, section.localId, subsection.localId)
							}}
							role="region"
							aria-label={`Subsection ${subsection.name}`}
						>
							<Collapsible.Root class=" space-y-2">
								<div class="flex flex-row">
									<div class="flex items-center justify-between space-x-4 px-4">
										<Collapsible.Trigger
											class={buttonVariants({
												variant: 'ghost',
												size: 'sm',
												class: 'w-9 p-0'
											})}
										>
											<Tooltip.Provider>
												<Tooltip.Root>
													<Tooltip.Trigger>
														<Button variant="ghost" size="sm" class="w-9 p-0">
															<Icon
																icon="fluent:chevron-up-down-24-regular"
																width="16"
																height="16"
															/>

															<span class="sr-only">Toggle</span>
														</Button>
													</Tooltip.Trigger>
													<Tooltip.Content>
														<p>Collaps to see</p>
													</Tooltip.Content>
												</Tooltip.Root>
											</Tooltip.Provider>
										</Collapsible.Trigger>
									</div>
									<div class="flex h-fit w-full flex-row">
										<Button
											variant="outline"
											class="h-full w-full p-2"
											onclick={() => openSubSectionForm(subsection.id, section.databaseId)}
										>
											<div class="flex-col">
												{subsection.Title || subsection.name}
												<p class=" text-gray-300">Drag cards into this section</p>
											</div>
										</Button>

										<AlertDialog.Root>
											<AlertDialog.Trigger class={buttonVariants({ variant: 'outline' })}>
												<Button variant="ghost" class="ml-1 h-full py-5">
													<Icon
														icon="weui:delete-outlined"
														width="20"
														height="20"
														style="color:red"
													/></Button
												>
											</AlertDialog.Trigger>
											<AlertDialog.Content>
												<AlertDialog.Header>
													<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
													<AlertDialog.Description>
														This action cannot be undone. This will permanently delete your Sub
														Section and remove your data from our servers.
													</AlertDialog.Description>
												</AlertDialog.Header>
												<AlertDialog.Footer>
													<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
													<AlertDialog.Action
														class="bg-destructive hover:bg-destructive dark:text-white"
														onclick={() =>
															handleDeleteSubsection(
																subsection.localId,
																section.localId,
																subsection.id
															)}>Delete</AlertDialog.Action
													>
												</AlertDialog.Footer>
											</AlertDialog.Content>
										</AlertDialog.Root>
									</div>
								</div>
								<Collapsible.Content class="space-y-2">
									<div
										class="h-fit w-full"
										role="list"
										aria-label={`Cards in Subsection: ${subsection.name}`}
									>
										{#each subsection.cards as subcard, index (subcard.localId)}
											<div
												class="hover-container my-1 items-center justify-between"
												ondragstart={(event) =>
													handleCardDragStart(subsection.localId, subcard.localId, event)}
												ondragover={(event) => {
													event.preventDefault(); // ✅ Prevent default behavior here
												}}
												ondrop={(event) => handleCardDrop(subsection.localId, index, event)}
												role="listitem"
												aria-label={`Draggable subcard: ${subcard.name}`}
											>
												<div class="relative flex w-[95%]">
													{#if subcard.name !== 'None'}
														<svelte:component
															this={formComponents[subcard.name]}
															responseType={subcard.name}
															id={subcard.id}
															card={subcard}
														/>
													{:else}
														<div class="relative"></div>
													{/if}

													<button
														class="delete-button"
														onclick={() =>
															openDeleteSubModal({
																sectionLocalId: section.localId,
																subsectionLocalId: subsection.localId,
																cardLocalId: subcard.localId,
																cardId: subcard.id,
																isSubsection: true // Indicating this is a subcard
															})}
														aria-label="Delete subcard"
													>
														<Icon
															icon="weui:delete-outlined"
															width="18"
															height="18"
															style="color: red"
														/>
													</button>
												</div>
											</div>
										{/each}

										{#if deleteSubButtonClicked}
											<div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"></div>

											<div class="fixed inset-0 z-50 flex items-center justify-center border">
												<div
													class="relative z-50 w-full max-w-lg border bg-background p-6 shadow-lg sm:rounded-lg md:w-full"
												>
													<div class="flex flex-col space-y-2 text-center sm:text-left">
														<h1 class="text-lg font-semibold">Are you absolutely sure?</h1>
														<p class="text-sm text-muted-foreground">
															This action cannot be undone. This will permanently delete your
															subcard.
														</p>
													</div>

													<div
														class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
													>
														<Button variant="outline" onclick={closeDeleteSubModal}>Cancel</Button>
														<Button
															class="bg-destructive hover:bg-destructive dark:text-white"
															onclick={() =>
																confirmDeleteSubcard(
																	cardToDelete.sectionLocalId,
																	cardToDelete.subsectionLocalId,
																	cardToDelete.cardLocalId,
																	cardToDelete.cardId
																)}
														>
															Delete
														</Button>
													</div>
												</div>
											</div>
										{/if}
									</div>
								</Collapsible.Content>
							</Collapsible.Root>
						</div>
					{/each}
				{/if}
				<!-- </div> -->
			</Collapsible.Content>
		</Collapsible.Root>
	</div>
{/each}

<style>
	.delete-button {
		@apply absolute -right-7 top-[40%] hidden border p-1 text-white;
	}

	.hover-container:hover .delete-button {
		@apply block;
	}

	.highlight {
		border: 2px solid blue; /* You can change the border style and color */
	}

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
