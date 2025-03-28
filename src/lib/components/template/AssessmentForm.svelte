<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '../ui/button/button.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { assessmentSchema, type AssessmentSchema } from './assessment-schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '../ui/checkbox';

	/////////////////////////////////////////////////////////////////////////////

	let { data }: { data: { form: SuperValidated<Infer<AssessmentSchema>> } } = $props();
	// console.log(data.form, 'This is data from section form editor');
	data.form.errors = {};

	// Initialize superForm
	const form = superForm(data.form, {
		validators: zodClient(assessmentSchema),
		applyAction: true,
		dataType: 'json'
	});
	const { form: formData, enhance } = form;
</script>

<Dialog.Root>
	<Dialog.Trigger class="{buttonVariants({ variant: 'default' })} my-2 w-28 md:ml-auto">
		Add New
	</Dialog.Trigger>
	<Dialog.Content class=" max-w-[50vh] sm:max-w-[50vh] md:max-w-[70vh] xl:max-w-[100vh] bg-[#fafaf9] dark:bg-[#0a0a0b]">
		<Dialog.Header>
			<Dialog.Title>Add New</Dialog.Title>
			<Dialog.Description>
				Make changes to your Assessment Template here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/newAssessment" use:enhance>
			<Form.Field {form} name="Title">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Title <span class="text-red-600">*</span></Form.Label>
						<Input {...props} bind:value={$formData.Title} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="Description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Input {...props} bind:value={$formData.Description} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="TenantCode">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Tenant Code</Form.Label>
						<Input {...props} bind:value={$formData.TenantCode} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="ItemsPerPage">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-right"
							>Select Items per page <span class="text-red-600">*</span></Form.Label
						>
						<Select.Root type="single" bind:value={$formData.ItemsPerPage} name="ItemsPerPage">
							<Select.Trigger class="col-span-3" {...props}>
								{$formData.ItemsPerPage
									? $formData.ItemsPerPage
									: 'Select a verified ItemsPerPage to display'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value="AllQuestions" label="All Questions">All Questions</Select.Item
									>
									<Select.Item value="OneQuestion" label="1 Question" disabled
										>1 Question</Select.Item
									>
									<Select.Item value="OneSection" label="1 Section" disabled>1 Section</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="Type">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-right">Type <span class="text-red-600">*</span></Form.Label>
						<Select.Root type="single" bind:value={$formData.Type} name="Type">
							<Select.Trigger {...props} class="col-span-3">
								{$formData.Type ? $formData.Type : 'Select a verified type to display'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value="Survey" label="Survey">Survey</Select.Item>
									<Select.Item value="Questionnaire" label="Questionnaire"
										>Questionnaire</Select.Item
									>
									<Select.Item value="TestPaper" label="TestPaper">Test Paper</Select.Item>
									<Select.Item value="DataCollection" label="DataCollection"
										>Data Collection</Select.Item
									>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description></Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="CurrentVersion">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>currentVersion</Form.Label>
						<Input {...props} bind:value={$formData.CurrentVersion} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="DefaultSectionNumbering">
				<Form.Control>
					<div class="my-4 flex flex-row gap-2">
						<Checkbox bind:checked={$formData.DefaultSectionNumbering} disabled />
						<div class="space-y-1 leading-none">
							<Form.Label>Default Section Numbering</Form.Label>
						</div>
					</div>

					<input name="DefaultSectionNumbering" value={$formData.DefaultSectionNumbering} hidden />
				</Form.Control>
			</Form.Field>

			<Dialog.Footer>
				<Button type="submit">Save changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
