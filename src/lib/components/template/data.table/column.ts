import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderSnippet } from "$lib/components/ui/data-table/index.js";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "./DataTableActions.svelte";
import DataTableCheckbox from "./DataTableCheckbox.svelte";
// import DataTableEmailButton from "./data-table/data-table-email-button.svelte";

/////////////////////////////////////////////////////////////////

export type DataTableProps<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
};

export type Template = {
  CreatedAt: Date;
  CurrentVersion: number;
  DefaultSectionNumbering: boolean;
  Description: string | null;
  DisplayCode: string;
  ItemsPerPage: string;
  OwnerUserId: string;
  RootSectionId: string;
  TenantCode: string;
  Title: string;
  Type: string;
  UpdatedAt: Date;
  id: string;
};

export const columns: ColumnDef<Template>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      renderComponent(DataTableCheckbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'Title',
    header: 'Title',
    cell: ({ row }) => {
      const titleSnippet = createRawSnippet<[string]>((getTitle) => ({
        render: () => `<div class="capitalize">${getTitle() || '-'}</div>`
      }));
      return renderSnippet(titleSnippet, row.getValue('Title'));
    }
  },
  {
    accessorKey: 'TenantCode',
    header: 'TenantCode',
    cell: ({ row }) => {
      const TenantCodeSnippet = createRawSnippet<[string]>((getTenantCode) => ({
        render: () => `<div class="capitalize">${getTenantCode() || '-'}</div>`
      }));
      return renderSnippet(TenantCodeSnippet, row.getValue('TenantCode'));
    }
  },
  {
    accessorKey: 'Description',
    header: 'Description',
    cell: ({ row }) => {
      const DescriptionSnippet = createRawSnippet<[string]>((getDescription) => ({
        render: () => `<div class="capitalize">${getDescription() || '-'}</div>`
      }));
      return renderSnippet(DescriptionSnippet, row.getValue('Description'));
    }
  },
  {
    accessorKey: 'CurrentVersion',
    header: 'CurrentVersion',
    cell: ({ row }) => {
      const CurrentVersionSnippet = createRawSnippet<[string]>((getCurrentVersion) => ({
        render: () => `<div class="capitalize">${getCurrentVersion() || '-'}</div>`
      }));
      return renderSnippet(CurrentVersionSnippet, row.getValue('CurrentVersion'));
    }
  },
  {
    accessorKey: 'Type',
    header: 'Type',
    cell: ({ row }) => {
      const typeSnippet = createRawSnippet<[string]>((getType) => ({
        render: () => `<div class="capitalize">${getType() || '-'}</div>`
      }));
      return renderSnippet(typeSnippet, row.getValue('Type'));
    }
  },
  {
    accessorKey: 'ItemsPerPage',
    header: 'ItemsPerPage',
    cell: ({ row }) => {
      const itemsPerPageSnippet = createRawSnippet<[string]>((getItemsPerPage) => ({
        render: () => `<div class="capitalize">${getItemsPerPage() || '-'}</div>`
      }));
      return renderSnippet(itemsPerPageSnippet, row.getValue('ItemsPerPage'));
    }
  },
  {
    accessorKey: 'CreatedAt',
    header: () => {
      const createdAtHeaderSnippet = createRawSnippet(() => ({
        render: () => `<div>Created At</div>`
      }));
      return renderSnippet(createdAtHeaderSnippet, '');
    },
    cell: ({ row }) => {
      const createdAtCellSnippet = createRawSnippet<[string]>((getCreatedAt) => ({
        render: () => `<div>${getCreatedAt() || '-'}</div>`
      }));
      const createdAt = row.getValue('CreatedAt');
      const formattedDate =
        (typeof createdAt === 'string' || typeof createdAt === 'number' || createdAt instanceof Date) &&
          !isNaN(new Date(createdAt).getTime())
          ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(createdAt))
          : '-';

      return renderSnippet(createdAtCellSnippet, formattedDate);
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id })
  }
];



