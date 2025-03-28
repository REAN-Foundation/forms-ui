<script lang="ts">
	import { browser } from '$app/environment';

	// import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	// import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	// import type { PageServerData } from './$types';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '../ui/button';
	import { errorMessage, successMessage } from '../toast/message.utils';
	import { toastMessage } from '../toast/toast.store';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	// import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';
	import TemplateForm from './TemplateForm.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, errors = $bindable() } = $props();

	let isLoading = $state(false);
	// $inspect(data.assessmentTemplate.Items);
	let assessmentTemplates = $state(data.assessmentTemplate.Items);
	// let retrivedAssessmentTemplates;
	const userId = page.params.userId;

	// let title = $state();
	// let type = $state();
	// let tags = $state();
	// let sortBy = 'Title';
	let sortOrder = $state('ascending');
	// let itemsPerPage = 10;
	// let offest = 0;
	// let totalAssessmentTemplatesCount = $state(data.data.assessmentTemplate.TotalCount);
	// let isSortingTitle = $state(false);
	// let isSortingType = $state(false);
	// let items = 10;

	// let paginationSettings = {
	// 	page: 0,
	// 	limit: 10,
	// 	size: totalAssessmentTemplatesCount,
	// 	amounts: [10, 20, 30, 50]
	// } satisfies PaginationSettings;

	// {
	//     if (title || type || tags) {
	//         paginationSettings.page = 0;
	//     }
	// }

	// async function searchAssessmentTemplate(model) {
	// 	let url = `/api/server/assessments/assessment-templates/search?`;
	// 	if (sortOrder) url += `sortOrder=${sortOrder}`;
	// 	else url += `sortOrder=ascending`;
	// 	if (sortBy) url += `&sortBy=${sortBy}`;
	// 	if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
	// 	if (offest) url += `&pageIndex=${offest}`;
	// 	if (title) url += `&title=${model.title}`;
	// 	if (type) url += `&type=${model.type}`;
	// 	if (tags) url += `&tags=${tags}`;
	// 	console.log('URL: ' + url);
	// 	const res = await fetch(url, {
	// 		method: 'GET',
	// 		headers: { 'content-type': 'application/json' }
	// 	});
	// 	const searchResult = await res.json();
	// 	totalAssessmentTemplatesCount = searchResult.TotalCount;
	// 	assessmentTemplates = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
	// 	if (totalAssessmentTemplatesCount > 0) {
	// 		isLoading = false;
	// 	}
	// }

	// {
	// 		assessmentTemplates = assessmentTemplates.map((item, index) => ({ ...item, index: index + 1 }));
	// 		paginationSettings.size = totalAssessmentTemplatesCount;
	// 		retrivedAssessmentTemplates = assessmentTemplates.slice(
	// 		paginationSettings.page * paginationSettings.limit,
	// 		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	// 	);
	// 	if (retrivedAssessmentTemplates.length > 0) {
	//             isLoading = false;
	//         }
	// }

	// $:console.log(retrivedAssessmentTemplates)
	// if (browser)
	// 	searchAssessmentTemplate({
	// 		title,
	// 		type,
	// 		tags: tags,
	// 		itemsPerPage: itemsPerPage,
	// 		pageIndex: page,
	// 		sortOrder: sortOrder,
	// 		sortBy: sortBy
	// 	});

	// function onPageChange(e: CustomEvent): void {
	// 	isLoading = true;
	// 	let pageIndex = e.detail;
	// 	itemsPerPage = items * (pageIndex + 1);
	// }

	// function onAmountChange(e: CustomEvent): void {
	// 	if (title || type || tags) {
	// 		isLoading = true;
	// 		assessmentTemplates = [];
	// 	}
	// 	// itemsPerPage = e.detail * (paginationSettings.page + 1);
	// 	items = itemsPerPage;
	// }

	// function sortTable(columnName) {
	// 	isSortingTitle = false;
	// 	isSortingType = false;
	// 	sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
	// 	if (columnName === 'Title') {
	// 		isSortingTitle = true;
	// 	} else if (columnName === 'Type') {
	// 		isSortingType = true;
	// 	}
	// 	sortBy = columnName;
	// }

	// const handleAssessmentTemplateDelete = async (id) => {
	// 	const assessmentTemplateId = id;
	// 	await Delete({
	// 		assessmentTemplateId: assessmentTemplateId
	// 	});
	// 	invalidate('app:assessmentTemplate');
	// };

	// async function Delete(model) {
	// 	await fetch(`/api/server/assessments/assessment-templates`, {
	// 		method: 'DELETE',
	// 		body: JSON.stringify(model),
	// 		headers: { 'content-type': 'application/json' }
	// 	});
	// }

	// let isLoading = false;

	// Sorting State
	// let sortOrder: 'ascending' | 'descending' = 'ascending';
	let isSortingTitle = $state(false);
	let isSortingType = $state(false);

	let link: string = $state();
	let open = $state(false);

	// Format date to readable format
	function formatDate(dateString: string): string {
		if (!dateString) return 'Invalid Date';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Invalid Date';
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: '2-digit'
		}).format(date);
	}

	// Sorting function
	function sortTable(field: 'Title' | 'Type') {
		const isTitleSort = field === 'Title';
		isSortingTitle = isTitleSort;
		isSortingType = !isTitleSort;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';

		assessmentTemplates.sort((a, b) => {
			const valueA = a[field]?.toLowerCase() || '';
			const valueB = b[field]?.toLowerCase() || '';

			if (sortOrder === 'ascending') return valueA.localeCompare(valueB);
			return valueB.localeCompare(valueA);
		});
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(link);
			successMessage('Link Copied');
		} catch (error) {
			errorMessage('Failed to copy link');
		}
	}

	function openLink() {
		window.open(link, '_blank');
	}

	async function handleDeleteAssessment(id: string) {
		try {
			const response = await fetch(`/api/server/template/${id}`, {
				method: 'DELETE'
			});
			const res = await response.json();
			console.log('response', res);
			// toastMessage(res);
			invalidate('app:template');
			open = false;
			// return response;
		} catch (error) {
			console.error('Delete Error:', error);
			// toastMessage();
			return null;
		}
	}

	function reviewAssessment(templateId: string) {
		console.log('this is template id', templateId);
		goto(`/users/${userId}/form-templates/${templateId}/preview`);
	}

	const createLink = async (templateId: string) => {
		try {
			const response = await fetch(`/api/server/submission`, {
				method: 'POST',
				body: JSON.stringify({ FormTemplateId: templateId }),
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await response.json();

			if (result.HttpCode === 201 || result.State === 'success') {
				link = result?.Data?.Link;
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Submission Error:', error);
			toastMessage();
			return null;
		}
	};
</script>

<!-- <div class="mt-1 flex flex-wrap gap-2">
	<div class="relative w-auto grow">
		<input
			type="text"
			name="title"
			placeholder="Search by title"
			bind:value={title}
			class="input w-full"
		/>
		{#if title}
			<button
				type="button"
				onclick={() => {
					title = '';
				}}
				class="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer border-0 bg-transparent"
			>
				<Icon icon="material-symbols:close" class="text-lg" />
			</button>
		{/if}
	</div>
</div>
<div class="relative w-auto grow">
	<input
		type="text"
		name="type"
		placeholder="Search by type"
		bind:value={type}
		class="input w-full"
	/>
	{#if type}
		<button
			type="button"
			onclick={() => {
				type = '';
			}}
			class="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer border-0 bg-transparent"
		>
			<Icon icon="material-symbols:close" class="text-lg" />
		</button>
	{/if}
</div> -->

<div class="mt-4 w-full overflow-x-auto">
	<table class="w-full table-auto border-collapse border border-slate-200">
		<thead class="border">
			<tr class="">
				<th class="p-4 text-center">Sr No</th>
				<th class="p-4 text-center">
					<Button variant="ghost" class="" onclick={() => sortTable('Title')}>
						Title {isSortingTitle ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</Button>
				</th>
				<th class="p-4 text-center">
					<Button variant="ghost" onclick={() => sortTable('Type')}>
						Type {isSortingType ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</Button>
				</th>
				<!-- <th class="p-4 text-center">Description</th>
				<th class="p-4 text-center">Tenant Code</th> -->
				<th class="p-4 text-center">Created At</th>
				<th class="p-4 text-center">Version</th>
				<th class="p-4 text-center">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if isLoading}
				<tr><td colspan="8" class="p-4 text-center">Loading...</td></tr>
			{:else if assessmentTemplates.length === 0}
				<tr><td colspan="8" class="p-4 text-center">No records found</td></tr>
			{:else}
				{#each assessmentTemplates as row, index}
					<tr class="border-b p-4">
						<td class=" text-center">{index + 1}</td>
						<td class="text-center capitalize">
							<a
								href={`/users/${userId}/form-templates/${row.id}/forms`}
								class="hover:text-blue-500 hover:underline"
							>
								{row.Title || 'Not specified'}
							</a>
						</td>
						<td class=" text-center">{row.Type || 'N/A'}</td>
						<!-- <td class=" text-center">{row.Description || '-'}</td>
						<td class=" text-center">{row.TenantCode || '-'}</td> -->
						<td class=" text-center">{formatDate(row.CreatedAt)}</td>
						<td class="text-center">{row.CurrentVersion || '-'}</td>
						<td class=" flex justify-center gap-4">
						
							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										<Dialog.Root>
											<Dialog.Trigger
												
											>
												<Button variant="ghost"
													><Icon icon="material-symbols:edit" width="24" height="24" />
												</Button>
											</Dialog.Trigger>
											<Dialog.Content
												class=" max-w-[50vh] sm:max-w-[50vh] md:max-w-[70vh] xl:max-w-[100vh] "
											>
												<Dialog.Header>
													<Dialog.Title>Add New</Dialog.Title>
													<Dialog.Description>
														Make changes to your Assessment Template here. Click save when you're
														done.
													</Dialog.Description>
												</Dialog.Header>
												<form method="POST" action="?/newAssessment" use:enhance>
													<TemplateForm templateData={row} bind:errors />
													<Dialog.Footer>
														<Button type="submit">Save changes</Button>
													</Dialog.Footer>
												</form>
											</Dialog.Content>
										</Dialog.Root>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Edit Template</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>

							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										<Button variant="ghost" onclick={() => reviewAssessment(row.id)}
											><Icon icon="icon-park-outline:preview-open" width="24" height="24" /></Button
										></Tooltip.Trigger
									>
									<Tooltip.Content>
										<p>Preview Template</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>

							<AlertDialog.Root>
								<AlertDialog.Trigger>
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button variant="ghost" class=""
													><Icon
														icon="material-symbols-light:link"
														width="20"
														height="20"
													/></Button
												></Tooltip.Trigger
											>
											<Tooltip.Content>
												<p>Generate Link for Template</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>This is the link for the template</AlertDialog.Title>
										<AlertDialog.Description>
											Generate link to copy and share form template for data collection.
											<div class="mt-5 flex w-full items-center space-x-2">
												<Input placeholder={link} />
												<Button onclick={() => createLink(row.id)}>Generate</Button>
											</div>
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel onclick={copyToClipboard}>
											<Icon icon="ion:copy-outline" width="20" height="20" class="mr-2" />
											Copy to clipboard
										</AlertDialog.Cancel>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action onclick={openLink}>Search</AlertDialog.Action>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>

							<AlertDialog.Root bind:open>
								<AlertDialog.Trigger class="">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button variant="ghost" class="">
													<Icon
														icon="material-symbols:delete-outline"
														class="text-red-500"
														width="24"
														height="24"
													/>
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Delete Template</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
										<AlertDialog.Description>
											This action cannot be undone. Deleting will remove the template and all
											associated data.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action
											class="w-fit"
											onclick={() => handleDeleteAssessment(row.id)}
										>
											Delete
										</AlertDialog.Action>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
