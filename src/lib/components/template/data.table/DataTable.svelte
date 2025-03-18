<script lang="ts" generics="TData, TValue">
	import {
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import * as Table from '$lib/components/ui/table/index.js';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import type { DataTableProps } from './column';
	import { writable } from 'svelte/store';

	///////////////////////////////////////////////////////////////////////////////////////////

	let { data, columns }: DataTableProps<TData, TValue> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const assessmentRecords = writable(columns);
	// Update the data store whenever `data` changes.
	$assessmentRecords = columns;

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});
	// const assessmentRecords = writable(columns);
	// // Update the data store whenever `data` changes.
	// $assessmentRecords = columns;

	// let table = createTable(assessmentRecords, {
	// 	page: addPagination(),
	// 	sort: addSortBy(),
	// 	filter: addTableFilter({
	// 		fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
	// 	}),
	// 	hide: addHiddenColumns()
	// });

	// const columns = table.createColumns([
	// 	table.column({ accessor: 'Title', header: 'Title' }),
	// 	// table.column({ accessor: 'id', header: 'Id' }),
	// 	table.column({
	// 		accessor: 'Type',
	// 		header: 'Type',
	// 		plugins: { sort: { disable: true }, filter: { exclude: true } }
	// 	}),
	// 	table.column({
	// 		accessor: 'CurrentVersion',
	// 		header: 'Current Version',
	// 		plugins: { sort: { disable: true }, filter: { exclude: true } }
	// 	}),
	// 	table.column({
	// 		accessor: 'CreatedAt',
	// 		header: 'Created At',
	// 		cell: ({ value }) => {
	// 			const date = new Date(value); // Convert the ISO string to a Date object
	// 			const formattedDate = new Intl.DateTimeFormat('en-US', {
	// 				day: 'numeric',
	// 				month: 'long',
	// 				year: 'numeric'
	// 			}).format(date);
	// 			return formattedDate;
	// 		},
	// 		plugins: { sort: { disable: true }, filter: { exclude: true } }
	// 	}),
	// 	table.column({
	// 		accessor: 'TenantCode',
	// 		header: 'Tenant Code',
	// 		plugins: { sort: { disable: true }, filter: { exclude: true } }
	// 	}),
	// 	// table.column({
	// 	// 	accessor: 'Description',
	// 	// 	header: 'Description',
	// 	// 	cell: ({ value }) => {
	// 	// 		return value ? value : 'Not Specified'; // Check if value is present, else return default text
	// 	// 	},
	// 	// 	plugins: { sort: { disable: true }, filter: { exclude: true } }
	// 	// }),
	// 	table.column({
	// 		accessor: ({ id }) => id,
	// 		header: '',
	// 		cell: ({ value }) => {
	// 			return createRender(DataTableActions, { id: value });
	// 		},
	// 		plugins: { sort: { disable: true }, filter: { exclude: true } }
	// 	})
	// ]);

	// const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns } =
	// 	table.createViewModel(columns);

	// const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	// const { filterValue } = pluginStates.filter;
	// const { hiddenColumnIds } = pluginStates.hide;

	// const ids = flatColumns.map((col) => col.id);
	// let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

	// $: $hiddenColumnIds = Object.entries(hideForId)
	// 	.filter(([, hide]) => !hide)
	// 	.map(([id]) => id);

	// const hidableCols = ['Title', 'Type', 'CurrentVersion', 'CreatedAt', 'TenantCode', 'Description'];
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
