<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '../ui/button';
	import { errorMessage, successMessage } from '../toast/message.utils';
	import { toastMessage } from '../toast/toast.store';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { enhance } from '$app/forms';
	import TemplateForm from './TemplateForm.svelte';
	import { assessmentSchema } from './assessment-schema';
	import * as Popover from '$lib/components/ui/popover/index.js';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, errors = $bindable(), handleTemplateUpdate } = $props();

	let isLoading = $state(false);
	let assessmentTemplates = $state(data.assessmentTemplate.Items);

	$effect(() => {
		assessmentTemplates = data.assessmentTemplate.Items;
	});
	const userId = page.params.userId;

	let sortOrder = $state('ascending');

	let isSortingTitle = $state(false);
	let isSortingType = $state(false);

	let link: string = $state();
	let open = $state(false);

	let isOpen = $state(false);
	let copied = $state(false);
	let activeMenu = $state(null);

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
			copied = true;
			setTimeout(() => (copied = false), 2000);
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
			toastMessage(res);
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

	async function handleSubmit(event: Event) {
		event.preventDefault();

		const form = (event.currentTarget as HTMLElement).closest('form');
		if (!form) {
			console.error('Form not found!');
			return;
		}

		const formData = new FormData(form);
		const model = {
			id: formData.get('id'),
			Title: formData.get('Title'),
			Description: formData.get('Description'),
			TenantCode: formData.get('TenantCode'),
			CurrentVersion: formData.get('CurrentVersion'),
			Type: formData.get('Type'),
			ItemsPerPage: formData.get('ItemsPerPage')
		};

		console.log('Form Model:', model);

		const result = await assessmentSchema.safeParseAsync(model);
		if (!result.success) {
			console.log('Client side validation error', result.error.flatten().fieldErrors);
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
		}

		if (Object.keys(errors).length === 0 || result?.success) {
			handleTemplateUpdate(model);
			isOpen = false;
		}
	}

	function toggleMenu(id) {
		activeMenu = activeMenu === id ? null : id;
	}
</script>

<div class="mt-4 w-full overflow-x-auto rounded-md border">
	<table class="w-full table-auto border-collapse border border-slate-200">
		<thead class="border">
			<tr class="bg-[#F6F8FA] dark:bg-[#0a0a0b]">
				<th class="w-12 p-3">Sr No</th>
				<th class="w-44 py-3 text-start">
					<Button variant="ghost" class=" text-md font-bold" onclick={() => sortTable('Title')}>
						Title {isSortingTitle ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</Button>
				</th>
				<th class=" w-32 py-3 text-start">
					<Button variant="ghost" class="text-md font-bold" onclick={() => sortTable('Type')}>
						Type {isSortingType ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</Button>
				</th>
				<!-- <th class="p-4 text-center">Description</th>
				<th class="p-4 text-center">Tenant Code</th> -->
				<th class=" w-32 p-3 text-center">Created At</th>
				<th class=" w-20 p-3 text-center">Version</th>
				<th class=" w-20 p-3 text-center">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if isLoading}
				<tr><td colspan="8" class="p-4 text-center">Loading...</td></tr>
			{:else if assessmentTemplates.length === 0}
				<tr><td colspan="8" class="p-4 text-center">No records found</td></tr>
			{:else}
				{#each assessmentTemplates as row, index}
					<tr class="border-b border-l border-r p-4">
						<td class=" text-center">{index + 1}</td>
						<td class=" px-3 py-1 text-sm capitalize">
							<a
								href={`/users/${userId}/form-templates/${row.id}/forms`}
								class="hover:text-blue-500 hover:underline"
							>
								{row.Title || 'Not specified'}
							</a>
						</td>
						<td class=" mx-10 px-3 py-1 text-sm">{row.Type || 'N/A'}</td>
						<td class=" px-3 py-1 text-center text-sm">{formatDate(row.CreatedAt)}</td>
						<td class=" text-center text-sm">{row.CurrentVersion || '-'}</td>
						<td class=" text-center text-sm">
							<Popover.Root>
								<Popover.Trigger>
									<button
										onclick={() => toggleMenu(row.id)}
										class="rotate-90 items-center rounded-md p-2 hover:bg-gray-200"
									>
										⠇
									</button>
								</Popover.Trigger>

								<Popover.Content class=" !flex !flex-col !items-start">
									{#if activeMenu === row.id}
										<Dialog.Root bind:open={isOpen}>
											<Dialog.Trigger onclick={() => (isOpen = true)}>
												<Button variant="ghost">
													<Icon icon="material-symbols:edit-outline" width="24" height="24" />
													<span>Edit</span>
												</Button>
											</Dialog.Trigger>
											<Dialog.Content
												class=" scrollbar-hide max-h-[90%] max-w-[95%] overflow-y-auto rounded-md md:max-w-[85%] lg:max-w-[45%] "
											>
												<Dialog.Header>
													<Dialog.Title>Add New</Dialog.Title>
													<Dialog.Description>
														Make changes to your form template here. Click save when you're done.
													</Dialog.Description>
												</Dialog.Header>
												<form method="post" use:enhance>
													<TemplateForm templateData={row} bind:errors />
													<Dialog.Footer>
														<Button class="my-2" onclick={handleSubmit} type="submit"
															>Save changes</Button
														>
													</Dialog.Footer>
												</form>
											</Dialog.Content>
										</Dialog.Root>
										<div>
											<Button variant="ghost" onclick={() => reviewAssessment(row.id)}
												><Icon icon="icon-park-outline:preview-open" width="24" height="24" />
												<span>Preview</span>
											</Button>
										</div>

										<AlertDialog.Root>
											<AlertDialog.Trigger>
												<Button variant="ghost" class=""
													><Icon icon="material-symbols:link" width="20" height="20" />
													<span>Generate Link</span>
												</Button>
											</AlertDialog.Trigger>
											<AlertDialog.Content>
												<AlertDialog.Header>
													<AlertDialog.Title>This is the link for the template</AlertDialog.Title>
													<AlertDialog.Description>
														Generate link to copy and share form template for data collection.
													</AlertDialog.Description>
												</AlertDialog.Header>
												<div class=" flex w-full items-center">
													<div class="relative w-full md:w-auto">
														<Input
															bind:value={link}
															type="text"
															class="w-76 overflow-x-auto whitespace-nowrap rounded-lg border px-4 py-2 pr-10 md:w-96 xl:w-96"
															readonly
														/>
														<Icon
															icon={copied
																? 'material-symbols:check-circle-rounded'
																: 'ion:copy-outline'}
															width="24"
															height="24"
															class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-white p-1"
															onclick={copyToClipboard}
														/>
													</div>
													<Button class="mx-1" onclick={() => createLink(row.id)}>Generate</Button>
												</div>

												<AlertDialog.Footer>
													<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
													<AlertDialog.Action onclick={openLink}>Search</AlertDialog.Action>
												</AlertDialog.Footer>
											</AlertDialog.Content>
										</AlertDialog.Root>

										<AlertDialog.Root bind:open>
											<AlertDialog.Trigger class="">
												<Button variant="ghost" class="">
													<Icon
														icon="material-symbols:delete-outline"
														class="text-red-500"
														width="24"
														height="24"
													/>
													<span>Delete</span>
												</Button>
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

										<!-- <Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										<Dialog.Root bind:open={isOpen}>
											<Dialog.Trigger onclick={() => (isOpen = true)}>
												<Button variant="ghost">
													<Icon icon="material-symbols:edit-outline" width="24" height="24" />
												</Button>
											</Dialog.Trigger>
											<Dialog.Content
												class="max-w-[50vh] sm:max-w-[50vh] md:max-w-[70vh] xl:max-w-[100vh]"
											>
												<Dialog.Header>
													<Dialog.Title>Add New</Dialog.Title>
													<Dialog.Description>
														Make changes to your form template here. Click save when you're done.
													</Dialog.Description>
												</Dialog.Header>
												<form method="post" use:enhance>
													<TemplateForm templateData={row} bind:errors />
													<Dialog.Footer>
														<Button class="my-2" onclick={handleSubmit} type="submit">Save changes</Button>
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
														icon="material-symbols:link"
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
							</AlertDialog.Root> -->
									{/if}
								</Popover.Content>
							</Popover.Root>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
