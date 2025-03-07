import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderSnippet } from "$lib/components/ui/data-table/index.js";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "./DataTableActions.svelte";
import DataTableCheckbox from "./DataTableCheckbox.svelte";
// import DataTableEmailButton from "./data-table/data-table-email-button.svelte";
// import * as Dialog from "$lib/components/ui/dialog/index.js";
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

const data ={}
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
    accessorKey: 'id',
    header: 'Edit',
    cell: ({ row }) => {
      const TenantCodeSnippet = createRawSnippet<[string]>((getTenantCode) => {
        const TenantCode = getTenantCode();
        return {
          render: () => `<Dialog.Root>
			<Dialog.Trigger class="{buttonVariants({ variant: 'default' })} ml-auto w-28">
				${Add New}
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[100vh]">
				<Dialog.Header>
					<Dialog.Title>Add New</Dialog.Title>
					<Dialog.Description>
						Make changes to your Assessment Template here. Click save when you're done.
					</Dialog.Description>
				</Dialog.Header>
				<form method="POST" action="?/newAssessment" use:enhance>
					<div class="">
						<AssessmentForm {data} />
					</div>
					<Dialog.Footer>
						<Button type="submit">Save changes</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>`
        };
      });
      return renderSnippet(TenantCodeSnippet, row.getValue('TenantCode'));
    }
  },
  {
    accessorKey: 'Title',
    header: 'Title',
    cell: ({ row }) => {
      const titleSnippet = createRawSnippet<[string]>((getTitle) => {
        const title = getTitle();
        return {
          render: () => `<div class="capitalize">${title}</div>`
        };
      });
      return renderSnippet(titleSnippet, row.getValue('Title'));
    }
  },
  
  {
    accessorKey: 'TenantCode',
    header: 'TenantCode',
    cell: ({ row }) => {
      const TenantCodeSnippet = createRawSnippet<[string]>((getTenantCode) => {
        const TenantCode = getTenantCode();
        return {
          render: () => `<div class="capitalize">${TenantCode}</div>`
        };
      });
      return renderSnippet(TenantCodeSnippet, row.getValue('TenantCode'));
    }
  },
  {
    accessorKey: 'Description',
    header: 'Description',
    cell: ({ row }) => {
      const DescriptionSnippet = createRawSnippet<[string]>((getDescription) => {
        const Description = getDescription();
        return {
          render: () => `<div class="capitalize">${Description}</div>`
        };
      });
      return renderSnippet(DescriptionSnippet, row.getValue('Description'));
    }
  },
  {
    accessorKey: 'CurrentVersion',
    header: 'CurrentVersion',
    cell: ({ row }) => {
      const CurrentVersionSnippet = createRawSnippet<[string]>((getCurrentVersion) => {
        const CurrentVersion = getCurrentVersion();
        return {
          render: () => `<div class="capitalize">${CurrentVersion}</div>`
        };
      });
      return renderSnippet(CurrentVersionSnippet, row.getValue('CurrentVersion'));
    }
  },

  {
    accessorKey: 'Type',
    // header: ({ column }) =>
    // 	renderComponent(DataTableEmailButton, {
    // 		onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    // 	}),
    header: 'Type',
    cell: ({ row }) => {
      const typeSnippet = createRawSnippet<[string]>((getType) => {
        const type = getType();
        return {
          render: () => `<div class="lowercase">${type}</div>`
        };
      });

      return renderSnippet(typeSnippet, row.getValue('Type'));
    }
  },
  {
    accessorKey: 'CreatedAt',
    header: () => {
      const createdAtHeaderSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-right">Created At</div>`
        };
      });
      return renderSnippet(createdAtHeaderSnippet, '');
    },
    cell: ({ row }) => {
      const createdAtCellSnippet = createRawSnippet<[string]>((getCreatedAt) => {
        const createdAt = getCreatedAt();
        return {
          render: () => `<div class="text-right font-medium">${createdAt}</div>`
        };
      });
      const date = new Date(row.getValue('CreatedAt')); // Convert the ISO string to a Date object
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);

      return renderSnippet(
        createdAtCellSnippet,
        // formatter.format(Number.parseFloat(row.getValue('CreatedAt')))
        // row.getValue('CreatedAt')
        formattedDate
      );
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id,data})
  }
];


