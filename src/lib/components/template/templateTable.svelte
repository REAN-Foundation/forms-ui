<script lang="ts">
	import { browser } from '$app/environment';

	// import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	// import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	// import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let data = $props();
	let isLoading = $state(false);
    console.log(data,"---------------------------------------------------");
	let assessmentTemplates = $state(data.data.assessmentTemplate.Items);
	let retrivedAssessmentTemplates;
	const userId = page.params.userId;

	let title = $state();
	let type = $state();
	let tags = $state();
	let sortBy = 'Title';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offest = 0;
	let totalAssessmentTemplatesCount = $state(data.data.assessmentTemplate.TotalCount);
	let isSortingTitle = $state(false);
	let isSortingType = $state(false);
	let items = 10;

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

	async function searchAssessmentTemplate(model) {
		let url = `/api/server/assessments/assessment-templates/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;
		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offest) url += `&pageIndex=${offest}`;
		if (title) url += `&title=${model.title}`;
		if (type) url += `&type=${model.type}`;
		if (tags) url += `&tags=${tags}`;
		console.log('URL: ' + url);
		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalAssessmentTemplatesCount = searchResult.TotalCount;
		assessmentTemplates = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalAssessmentTemplatesCount > 0) {
			isLoading = false;
		}
	}

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
	if (browser)
		searchAssessmentTemplate({
			title,
			type,
			tags: tags,
			itemsPerPage: itemsPerPage,
			pageIndex: page,
			sortOrder: sortOrder,
			sortBy: sortBy
		});

	function onPageChange(e: CustomEvent): void {
		isLoading = true;
		let pageIndex = e.detail;
		itemsPerPage = items * (pageIndex + 1);
	}

	function onAmountChange(e: CustomEvent): void {
		if (title || type || tags) {
			isLoading = true;
			assessmentTemplates = [];
		}
		// itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
	}

	function sortTable(columnName) {
		isSortingTitle = false;
		isSortingType = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Title') {
			isSortingTitle = true;
		} else if (columnName === 'Type') {
			isSortingType = true;
		}
		sortBy = columnName;
	}

	const handleAssessmentTemplateDelete = async (id) => {
		const assessmentTemplateId = id;
		await Delete({
			assessmentTemplateId: assessmentTemplateId
		});
		invalidate('app:assessmentTemplate');
	};

	async function Delete(model) {
		await fetch(`/api/server/assessments/assessment-templates`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
	}
</script>

<div class="mt-1 flex flex-wrap gap-2">
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
</div>


<div class="table-container !border-secondary-100 dark:!border-surface-700 my-2 !border">
	<table class="table" role="grid">
		<thead class="!variant-soft-secondary">
			<tr>
				<th data-sort="index">Id</th>
				<th>
					<button onclick={() => sortTable('Title')}>
						Title {isSortingTitle ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</button>
				</th>
				<th>
					<button onclick={() => sortTable('Type')}>
						Type {isSortingType ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</button>
				</th>
				<th>Tags</th>
				<th>Provider</th>
				<th />
				<th />
			</tr>
		</thead>
		<tbody class="!bg-white dark:!bg-inherit">
			{#if retrivedAssessmentTemplates}
				<tr>
					<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
				</tr>
			{:else}
				{#each retrivedAssessmentTemplates as row}
					<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
						<td role="gridcell" aria-colindex={1} tabindex="0">{row.index}</td>
						<td role="gridcell" aria-colindex={2} tabindex="0">
							<!-- <a href={viewRoute(row.id)}>
								{row.Title !== null && row.Title !== ''
								? Helper.truncateText(row.Title, 40)
								: 'Not specified'}
							</a> -->
                            <p>{row}</p>
						</td>
						<td role="gridcell" aria-colindex={3} tabindex="0">
							{Helper.truncateText(row.Type, 40)}
						</td>
						<!-- <td role="gridcell">{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td> -->
						<!-- <td role="gridcell" aria-colindex={4} tabindex="0">
							{row.Provider !== null && row.Provider !== ''
								? Helper.truncateText(row.Provider, 40)
								: 'Not specified'}
						</td> -->
						<td>
							<!-- <a href={editRoute(row.id)} class="btn p-2 -my-1 hover:variant-soft-primary">
								<Icon icon="material-symbols:edit-outline" class="text-lg" />
							</a> -->
                            <p>SZXV</p>
						</td>
						<td>
							<!-- <Confirm
								confirmTitle="Delete"
								cancelTitle="Cancel"
								let:confirm={confirmThis}
							>
								<button
									on:click|preventDefault={() => confirmThis(handleAssessmentTemplateDelete, row.id)}
									class="btn p-2 -my-1 hover:variant-soft-error"
								>
									<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
								</button>
								<span slot="title">Delete</span>
								<span slot="description">
									Are you sure you want to delete a assessment?
								</span>
							</Confirm> -->
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<!-- <div class="w-full variant-soft-secondary rounded-lg p-2">
	<Paginator
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		buttonClasses=" text-primary-500"
		regionControl = 'bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200'
		controlVariant = 'rounded-full text-primary-500 '
		controlSeparator = 'fill-primary-400'
		/>
</div> -->
