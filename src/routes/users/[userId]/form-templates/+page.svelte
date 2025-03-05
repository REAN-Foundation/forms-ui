<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { AssessmentForm, DataTable } from '$lib/index';
	// import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	// import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	// import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { columns } from '$lib/components/template/data.table/column';

	//////////////////////////////////////////////////////////////////////

	// let data: PageServerData = $props();
	let { data }: { data: PageServerData } = $props();
	console.log(data)
	let assessments = data.assessmentTemplate;

	let expandedItem: string | null = $state();
	let selectedSubmenu: string | null = $state('createForm');

	type SubMenuItem = {
		name: string;
		icon: string;
		action: () => void;
	};

	type MenuItem = {
		name: string;
		icon: string;
		subMenuItems: SubMenuItem[];
	};

	const menuItems: MenuItem[] = [
		{
			name: 'Forms',
			icon: 'fluent-mdl2:file-template',
			subMenuItems: [
				{
					name: 'Create New Form',
					icon: 'mdi:form-textbox',
					action: () => selectSubmenu('createForm')
				},
				{ name: 'View Forms', icon: 'mdi-light:eye', action: () => selectSubmenu('viewForms') }
				// {
				// 	name: 'Library',
				// 	icon: 'bx:library',
				// 	action: () => selectSubmenu('library')
				// },
				// {
				// 	name: 'Import Forms',
				// 	icon: 'prime:file-import',
				// 	action: () => selectSubmenu('importForm')
				// }
			]
		},

		// {
		// 	name: 'Responses',
		// 	icon: 'fluent-mdl2:responses-menu',
		// 	subMenuItems: [
		// 		{
		// 			name: 'View Responses',
		// 			icon: 'carbon:task-view',
		// 			action: () => selectSubmenu('viewResponses')
		// 		},
		// 		{
		// 			name: 'Export Responses',
		// 			icon: 'mdi:export',
		// 			action: () => selectSubmenu('exportResponses')
		// 		}
		// 	]
		// },
		// {
		// 	name: 'Setting',
		// 	icon: 'weui:setting-outlined',
		// 	subMenuItems: [
		// 		{
		// 			name: 'Profile Settings',
		// 			icon: 'mdi:account-cog-outline',
		// 			action: () => selectSubmenu('profileSettings')
		// 		},
		// 		{
		// 			name: 'App Settings',
		// 			icon: 'weui:setting-outlined',
		// 			action: () => selectSubmenu('appSettings')
		// 		}
		// 	]
		// }
	];

	function toggleExpand(itemName: string) {
		expandedItem = expandedItem === itemName ? null : itemName;
	}

	function selectSubmenu(submenu: string) {
		selectedSubmenu = submenu;
	}
</script>

<div class="relative flex h-[95vh] w-full flex-row">
	<!-- Sidebar -->
	<div class="flex h-full w-1/4 flex-col justify-between border-r p-4">
		<div class="flex flex-col space-y-2">
			{#each menuItems as item}
				<div>
					<div class="group relative">
						<Button
							class="w-full justify-start space-x-2 px-5 py-3 duration-500"
							onclick={() => toggleExpand(item.name)}
							variant="outline"
						>
							<Icon icon={item.icon} width="25" height="25" class="text-primary" />
							<p>{item.name}</p>
						</Button>
					</div>

					{#if expandedItem === item.name}
						<div class="ml-8 mt-2 flex flex-col space-y-2">
							{#each item.subMenuItems as subItem}
								<Button class="flex justify-start" variant="ghost" onclick={subItem.action}>
									<Icon icon={subItem.icon} width="20" height="20" class="text-primary" />
									<p class="px-2 text-left">{subItem.name}</p>
								</Button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="h-full w-full">
		<div class="container mx-auto py-10">
			{#if selectedSubmenu === 'createForm'}
				<div class="h-full w-full">
					<div class="container mx-auto">
						<div class="mb-4 flex flex-row">
							<div>
								<h2 class="text-2xl font-bold tracking-tight">Welcome...!</h2>
								<p class="text-muted-foreground">Here's a list of your Assessments!</p>
							</div>
							<Dialog.Root>
								<Dialog.Trigger class="{buttonVariants({ variant: 'default' })} ml-auto w-28">
									Add New
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
							</Dialog.Root>
						</div>

						<DataTable data={assessments} {columns} />
					</div>
				</div>
			{:else if selectedSubmenu === 'viewForms'}
				<div class="container mx-auto">
					<h2 class="text-2xl font-bold tracking-tight">View Forms</h2>
					<p class="text-muted-foreground">Here's a list of your Assessments!</p>
					<!-- <DataTable data={assessments} {columns} /> -->
				</div>
			{:else if selectedSubmenu === 'library'}
				<h2 class="text-2xl font-bold tracking-tight">Make library</h2>
				<p class="text-muted-foreground">Here's a list of your Assessments!</p>
			{:else if selectedSubmenu === 'importForm'}
				<h2 class="text-2xl font-bold tracking-tight">Import Form</h2>
				<p class="text-muted-foreground">Here's a list of your Assessments!</p>
			{:else if selectedSubmenu === 'viewResponses'}
				<h2 class="text-2xl font-bold tracking-tight">Responses</h2>
				<p class="text-muted-foreground">Here's a list of responses to your forms.</p>
			{:else if selectedSubmenu === 'exportResponses'}
				<h2 class="text-2xl font-bold tracking-tight">Export Responses</h2>
				<p class="text-muted-foreground">Export responses for offline use.</p>
			{:else if selectedSubmenu === 'profileSettings'}
				<h2 class="text-2xl font-bold tracking-tight">Profile Settings</h2>
				<p class="text-muted-foreground">Adjust your profile details here.</p>
			{:else if selectedSubmenu === 'appSettings'}
				<h2 class="text-2xl font-bold tracking-tight">App Settings</h2>
				<p class="text-muted-foreground">Configure application settings here.</p>
			{:else}
				<h2 class="text-2xl font-bold tracking-tight">Welcome back...!</h2>
				<p class="text-muted-foreground">Here's a list of your Assessments!</p>
				<p class="text-muted-foreground">Error in loading this page</p>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes slide {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}
</style>
