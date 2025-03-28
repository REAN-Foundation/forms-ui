<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { goto, invalidate } from '$app/navigation';
	// import { page } from '$app/stores';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Icon from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { errorMessage, successMessage } from '$lib/components/toast/message.utils';

	////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { id }: { id: string } = $props();
	const userId = page.params.userId;
	// let response;
	// let submissionId = $state();
	// let createdLink = $state();
	let link: string = $state();
	let open = $state(false);
	// link = createdLink + `/${submissionId}`;

	// let openLinkToNew =$state()
	// console.log(response);
	// console.log(submissionId);
	// console.log(createdLink);

	function addQuestions(templateId: string) {
		goto(`/users/${userId}/form-templates/${templateId}/forms`);
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
		// response = await submission({ templateId });
		// submissionId = response.Data.id;
		// createdLink = response.Data.FormUrl;
		// submissionId && createdLink
		// 	? toast.success('Link has been generated')
		// 	: toast.error('Error in creating the link');
		// invalidate('app:assessmentTemplate');

		// link = createdLink + `/${submissionId}`;
	};

	// async function submission(model: { templateId: string }) {
	// 	try {
	// 		const response = await fetch(`/api/server/submission`, {
	// 			method: 'POST',
	// 			body: JSON.stringify(model),
	// 			headers: { 'Content-Type': 'application/json' }
	// 		});
	// 		return await response.json();
	// 	} catch (error) {
	// 		console.error('Submission Error:', error);
	// 		return null;
	// 	}
	// }

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
		// response.ok
		// 	? toast.success('Assessment Deleted Successfully')
		// 	: toast.error('Error in deleting Assessment');
		// invalidate('app:assessmentTemplate');
	}

	// async function Delete(model: { templateId: string }) {
	// 	try {
	// 		const response = await fetch(`/api/server/assessment`, {
	// 			method: 'DELETE',
	// 			body: JSON.stringify(model),
	// 			headers: { 'Content-Type': 'application/json' }
	// 		});
	// 		return response;
	// 	} catch (error) {
	// 		console.error('Delete Error:', error);
	// 		return null;
	// 	}
	// }
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Icon icon="lucide:ellipsis" width="16" height="16" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-44 space-y-2 ">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading class="text-sm text-gray-500">Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item class="">
				<Button
					variant="ghost"
					class="h-8 w-full justify-start "
					onclick={() => reviewAssessment(id)}
				>
					Preview
				</Button>
			</DropdownMenu.Item>

			<DropdownMenu.Item class="">
				<Button variant="ghost" class="h-8 w-full justify-start " onclick={() => addQuestions(id)}>
					Edit
				</Button>
			</DropdownMenu.Item>

			<!-- <DropdownMenu.Separator /> -->
			<!-- <DropdownMenu.Item class=" p-1"> -->
			<AlertDialog.Root>
				<AlertDialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
					<Button variant="ghost" class="flex  w-full content-start">Generate Link</Button>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>This is the link for the template</AlertDialog.Title>
						<AlertDialog.Description>
							Generate link to copy and share form template for data collection.
							<div class="mt-5 flex w-full items-center space-x-2">
								<Input placeholder={link} />
								<Button onclick={() => createLink(id)}>Generate</Button>
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
			<!-- </DropdownMenu.Item> -->
			<!-- <AlertDialog.Root>
			<AlertDialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
				<Button variant="ghost" class="h-8 w-full justify-start">Generate Link</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>This is the link for the template</AlertDialog.Title>
					<AlertDialog.Description>
						Copy the link and share your template as a personal question paper to collect data.
						<div class="mt-5 flex w-full items-center space-x-2">
							<Input placeholder={link} />
							<Button onclick={() => createLink(id)}>Generate</Button>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel onclick={copyToClipboard}>
						<Icon icon="ion:copy-outline" width="20" height="20" class="mr-2" />
						Copy to clipboard
					</AlertDialog.Cancel>
					<AlertDialog.Action onclick={openLink}>Search</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>

		<DropdownMenu.Separator /> -->
			<!-- <DropdownMenu.Item  class=""> -->
			<AlertDialog.Root bind:open>
				<AlertDialog.Trigger class="w-full">
					<Button
						variant="ghost"
						class="h-8 w-full justify-start text-destructive hover:bg-destructive hover:text-white"
					>
						Delete
					</Button>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. Deleting will remove the template and all associated
							data.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action class="w-fit" onclick={() => handleDeleteAssessment(id)}>
							Delete
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>

			<!-- </DropdownMenu.Item> -->
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
