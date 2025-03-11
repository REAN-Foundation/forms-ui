<script lang="ts">
	import { dropzone } from '$lib/components/common/dnd';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Icon from '@iconify/svelte';
	import { formComponents } from './response.types/index';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	////////////////////////////////////////////////////////////////////////////

	let {
		uiSections = $bindable(),
		highlightedSection,
		highlightedSubSection,
		deleteButtonClicked,
		deleteSubButtonClicked,
		openSheet,
		handleDeleteCard1,
		handleDragAndDrop1,
		sectionForm,
		subSectionForm,
		closeSheet
	} = $props();

	let cardToDelete = $state('');

	//1 For handleing drag enter
	function handleDragEnter(sectionId: number) {
		highlightedSection = sectionId;
	}

	//2 For handleing drag leave
	function handleDragLeave(sectionId: number) {
		if (highlightedSection === sectionId) {
			highlightedSection = null;
		}
	}

	//3 For handleing drag over
	function handleDragOver(sectionId: number, event: DragEvent) {
		event.preventDefault();
		highlightedSection = sectionId;
	}

	// For handleing drag enter of subsection
	function handleDragEnterSubsection(subSectionId: number) {
		highlightedSubSection = subSectionId;
	}

	// For handleing drag leave of subsection
	function handleDragLeaveSubsection(subSectionId: number) {
		if (highlightedSubSection === subSectionId) {
			highlightedSubSection = null;
		}
	}

	// For handleing drag over of subsection
	function handleDragOverSubsection(subSectionId: number, event: DragEvent) {
		event.preventDefault();
		highlightedSubSection = subSectionId;
	}

	// For opening the delete modal
	function openDeleteModal(card: string) {
		deleteButtonClicked = true;
		cardToDelete = card;
	}

	// For closing the delete modal
	function closeDeleteModal() {
		deleteButtonClicked = false;
		cardToDelete = null;
	}

	// For confirming the deletion
	function confirmDeleteCard(cardId: string, type: string) {
		console.log(cardId);
		handleDeleteCard1(cardId, type);
		closeDeleteModal();
	}

	// For closing subsection card delete model
	function closeDeleteSubModal() {
		deleteSubButtonClicked = false;
		cardToDelete = null;
	}
</script>

{#each uiSections as section, index (section.id)}
	<div
		class="my-4 border p-3 {highlightedSection === section.id ? 'highlight' : ''}"
		ondragenter={() => handleDragEnter(section.id)}
		ondragleave={() => handleDragLeave(section.id)}
		ondragover={(event) => handleDragOver(section.id, event)}
		use:dropzone={{
			on_dropzone: (data, e) => handleDragAndDrop1(data, e, section.id)
		}}
		role="region"
		aria-label={`Section ${section.Title}`}
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
					<Button variant="outline" class="h-full w-full p-2">
						<!-- onclick={() => sectionEditRoute(section.id)} -->
						<div class="flex-col">
							{#if section.Title}
								<p>{section.Title}</p>
							{:else}
								<p>{`Section ${index + 1}`}</p>
							{/if}
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
									onclick={() => confirmDeleteCard(section.id, 'Section')}
									>Delete</AlertDialog.Action
								>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</div>
			<Collapsible.Content class="space-y-2">
				<div class="h-fit w-full p-1" role="list" aria-label={`Cards in section: ${section.Title}`}>
					{#if section.Questions.length === 0}
						<p class="text-center text-sm text-slate-500">Drop response type cards here</p>
					{/if}

					<!-- {#each [...section.cards].sort((a, b) => a.localId - b.localId) as card, index (card.localId)} -->
					{#each section.Questions as card, index (card.id)}
						<div
							class="hover-container items-center justify-between"
							draggable="true"
							ondragover={(event) => {
								event.preventDefault();
							}}
							role="listitem"
							aria-label={`Card: ${card.Title}`}
						>
							<div class="relative mt-1 flex w-[95%]">
								{#if card.ResponseType !== 'None'}
									<svelte:component this={formComponents[card.ResponseType]} {card} {openSheet} />
								{/if}
								<button
									class="delete-button"
									onclick={() => openDeleteModal(card.id)}
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
										onclick={() => confirmDeleteCard(cardToDelete, 'Card')}
									>
										Delete
									</Button>
								</div>
							</div>
						</div>
					{/if}
				</div>

				{#if section.Subsections.length > 0}
					{#each section.Subsections as subsection, index (subsection.id)}
						<div
							class="my-2 h-fit w-full p-1 {highlightedSubSection === subsection.id
								? 'highlight'
								: ''} "
							ondragenter={() => handleDragEnterSubsection(subsection.id)}
							ondragleave={() => handleDragLeaveSubsection(subsection.id)}
							ondragover={(event) => handleDragOverSubsection(subsection.id, event)}
							use:dropzone={{
								on_dropzone: (data, e) => handleDragAndDrop1(data, e, section.id, subsection.id)
							}}
							role="region"
							aria-label={`Subsection ${subsection.Title}`}
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
										<Button variant="outline" class="h-full w-full p-2">
											<!-- onclick={() => openSubSectionForm(subsection.id, section.databaseId)} -->
											<div class="flex-col">
												{#if subsection.Title}
													<p>{subsection.Title}</p>
												{:else}
													<p>{`Subsection ${index + 1}`}</p>
												{/if}
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
														onclick={() => confirmDeleteCard(subsection.id, 'Section')}
														>Delete</AlertDialog.Action
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
										aria-label={`Cards in Subsection: ${subsection.Title}`}
									>
										{#each subsection.Questions as subcard, index (subcard.id)}
											<div
												class="hover-container my-1 items-center justify-between"
												ondragover={(event) => {
													event.preventDefault();
												}}
												role="listitem"
												aria-label={`Draggable subcard: ${subcard.Title}`}
											>
												<div class="relative flex w-[95%]">
													{#if subcard.name !== 'None'}
														<svelte:component
															this={formComponents[subcard.ResponseType]}
															card={subcard}
															{openSheet}
														/>
													{:else}
														<div class="relative"></div>
													{/if}

													<button
														class="delete-button"
														onclick={() => openDeleteModal(subcard.id)}
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
															onclick={() => confirmDeleteCard(cardToDelete, 'Card')}
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
