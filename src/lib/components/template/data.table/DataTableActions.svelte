<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Icon from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { id }: { id: string } = $props();
	const userId = $page.params.userId;
	let response;
	let submissionId: string = '';
	let createdLink: string = '';
	let link: string = $state();
	link = createdLink + `/${submissionId}`;

	function addQuestions(templateId: string) {
		goto(`/users/${userId}/form-templates/${templateId}/forms`);
	}

	function reviewAssessment(templateId: string) {
		console.log('this is template id', templateId);
		goto(`/users/${userId}/form-templates/${templateId}/preview`);
	}

	const createLink = async (templateId: string) => {
		response = await submission({ templateId });
		submissionId = response?.Data?.id;
		createdLink = response.Data.FormUrl;
		submissionId && createdLink
			? toast.success('Link has been generated')
			: toast.error('Error in creating the link');
		invalidate('app:assessmentTemplate');
	};

	async function submission(model: { templateId: string }) {
		try {
			const response = await fetch(`/api/server/submission`, {
				method: 'POST',
				body: JSON.stringify(model),
				headers: { 'Content-Type': 'application/json' }
			});
			return await response.json();
		} catch (error) {
			console.error('Submission Error:', error);
			return null;
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(link);
			toast.success('Link Copied');
		} catch (error) {
			toast.error('Failed to copy link');
		}
	}

	function openLink() {
		window.open(link, '_blank');
	}

	async function handleDeleteAssessment(id: string) {
		const response = await Delete({ templateId: id });
		response.ok
			? toast.success('Assessment Deleted Successfully')
			: toast.error('Error in deleting Assessment');
		invalidate('app:assessmentTemplate');
	}

	async function Delete(model: { templateId: string }) {
		try {
			const response = await fetch(`/api/server/assessment`, {
				method: 'DELETE',
				body: JSON.stringify(model),
				headers: { 'Content-Type': 'application/json' }
			});
			return response;
		} catch (error) {
			console.error('Delete Error:', error);
			return null;
		}
	}
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
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item>
				<Button
					variant="ghost"
					class="h-5 w-full justify-start"
					onclick={() => reviewAssessment(id)}>Preview</Button
				>
			</DropdownMenu.Item>
		</DropdownMenu.Group>

		<DropdownMenu.Item>
			<Button variant="ghost" class="h-5 w-full justify-start" onclick={() => addQuestions(id)}
				>Add Questions</Button
			>
		</DropdownMenu.Item>

		<AlertDialog.Root>
			<AlertDialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
				<Button variant="ghost" class="h-8 w-full justify-start pl-6 ">Generate Link</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header
					><AlertDialog.Footer>
						<AlertDialog.Cancel>
							<Icon icon="iwwa:delete" width="16" height="16" />
						</AlertDialog.Cancel></AlertDialog.Footer
					>
					<AlertDialog.Title>This is link for the template</AlertDialog.Title>
					<AlertDialog.Description>
						Copy the link and search your template as your personal question paper share with
						community to collect the data.
						<!-- <Input>this is link{link}</Input>  -->
						<div class="mt-5 flex w-full items-center space-x-2">
							<Input placeholder={link} />
							<Button onclick={() => createLink(id)}>Generate</Button>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel onclick={copyToClipboard}
						><Icon icon="ion:copy-outline" width="20" height="20" class="mr-2" />
						Copy to clipboard</AlertDialog.Cancel
					>
					<AlertDialog.Action onclick={openLink}>Search</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>

		<DropdownMenu.Separator />

		<AlertDialog.Root>
			<AlertDialog.Trigger class="{buttonVariants({ variant: 'ghost' })} w-full ">
				<Button variant="ghost" class="h-8 w-full justify-start pl-6">Delete</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. Deleting will remove the assessment and all associated
						data.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action
						class="w-fit bg-destructive hover:bg-destructive dark:text-white"
						onclick={() => handleDeleteAssessment(id)}>Delete</AlertDialog.Action
					>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</DropdownMenu.Content>
</DropdownMenu.Root>
