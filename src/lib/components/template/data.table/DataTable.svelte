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
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '@iconify/svelte';

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

<!-- <div class="rounded-md border">
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
</div> -->

<div class="w-full">
	<div class="flex items-center py-2 md:py-4">
		<Input
			placeholder="Filter titles..."
			value={(table.getColumn('Title')?.getFilterValue() as string) ?? ''}
			oninput={(e) => table.getColumn('Title')?.setFilterValue(e.currentTarget.value)}
			onchange={(e) => table.getColumn('Title')?.setFilterValue(e.currentTarget.value)}
			class="max-w-sm bg-[#F6F8FA] dark:bg-[#0a0a0b]"
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto bg-[#F6F8FA] dark:bg-[#0a0a0b]">
						Columns <Icon icon="iconamoon:arrow-down-2-light" class="ml-2 size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						<Table.Head class="bg-[#F6F8FA]  pl-3 dark:bg-[#0a0a0b]"></Table.Head>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="bg-[#F6F8FA] dark:bg-[#0a0a0b] [&:has([role=checkbox])]:pl-3">
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
				{#each table.getRowModel().rows as row, index (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						<Table.Cell class="pl-3">{index + 1}</Table.Cell>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="[&:has([role=checkbox])]:pl-3">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length + 1} class="h-24 text-center"
							>No results.</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex items-center justify-end space-x-2 pt-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{table.getFilteredSelectedRowModel().rows.length} of
			{table.getFilteredRowModel().rows.length} row(s) selected.
		</div>
		<div class="space-x-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
				class="border border-gray-300 bg-[#F6F8FA] dark:bg-[#0a0a0b]"
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
				class="border border-gray-300 bg-[#F6F8FA] dark:bg-[#0a0a0b]"
			>
				Next
			</Button>
		</div>
	</div>
</div>
