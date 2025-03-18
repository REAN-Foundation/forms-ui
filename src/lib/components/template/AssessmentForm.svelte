<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { assessmentSchema, type AssessmentSchema } from './assessment-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';

	/////////////////////////////////////////////////////////////////////////////

	let { data }: { data: { form: SuperValidated<Infer<AssessmentSchema>> } } = $props();

	console.log(data.form,"This is data from section form editor");
		// Initialize superForm
	const form = superForm(data.form,{
		validators: zodClient(assessmentSchema),
		applyAction: true,
		dataType: 'json'
	});

	const { form: formData, enhance } = form;
</script>

<!-- <form method="post" action="?/newAssessment" use:enhance> -->
<Form.Field {form} name="title">
	<Form.Control>
		<!-- <div class="grid grid-cols-4 items-center gap-4"> -->
		{#snippet children({ props })}
			<Form.Label>Title <span class="text-red-600">*</span></Form.Label>
			<Input {...props} bind:value={$formData.title} />
		{/snippet}
		<!-- <Form.Label class="text-right">Title <span class="text-red-600">*</span></Form.Label>
			<Input class="col-span-3" {...attrs} bind:value={$formData.title} required /> -->
		<!-- </div> -->
	</Form.Control>
	<!-- <Form.Description>This is Template name.</Form.Description> -->
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="description">
	<Form.Control>
		<!-- <div class="grid grid-cols-4 items-center gap-4"> -->
		{#snippet children({ props })}
			<Form.Label>Description</Form.Label>
			<Input {...props} bind:value={$formData.description} />
		{/snippet}
		<!-- <Form.Label class="text-right">Description</Form.Label>
			<Input class="col-span-3" {...attrs} bind:value={$formData.description} /> -->
		<!-- </div> -->
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="tenantCode">
	<Form.Control>
		<!-- <div class="grid grid-cols-4 items-center gap-4"> -->
		{#snippet children({ props })}
			<Form.Label>Tenant Code</Form.Label>
			<Input {...props} bind:value={$formData.tenantCode} />
		{/snippet}
		<!-- <Form.Label class="text-right">Tenant Code <span class="text-red-600">*</span></Form.Label>
			<Input class="col-span-3" {...attrs} bind:value={$formData.tenantCode} required /> -->
		<!-- </div> -->
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="itemsPerPage">
	<Form.Control>
		<!-- <div class="grid grid-cols-4 items-center gap-4"> -->
		{#snippet children({ props })}
			<Form.Label class="text-right"
				>Select Items per page <span class="text-red-600">*</span></Form.Label
			>
			<Select.Root type="single" bind:value={$formData.itemsPerPage} name="itemsPerPage">
				<Select.Trigger class="col-span-3" {...props}>
					{$formData.itemsPerPage
						? $formData.itemsPerPage
						: 'Select a verified itemsPerPage to display'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="OneQuestion" label="1 Question">1 Question</Select.Item>
						<Select.Item value="OneSection" label="1 Section">1 Section</Select.Item>
						<!-- <Select.Item value="FiveQuestions" label="5 Questions" />
					<Select.Item value="TenQuestions" label="10 Questions" /> -->
						<Select.Item value="AllQuestions" label="All Questions">All Questions</Select.Item>

						<!-- <Select.Item value="AllSections" label="All Sections" /> -->
					</Select.Group>
				</Select.Content>
			</Select.Root>
		{/snippet}
		<!-- </div> -->
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="type">
	<Form.Control>
		<!-- <div class="grid grid-cols-4 items-center gap-4"> -->
		{#snippet children({ props })}
			<Form.Label class="text-right">Type <span class="text-red-600">*</span></Form.Label>
			<Select.Root type="single" bind:value={$formData.type} name="type">
				<Select.Trigger {...props} class="col-span-3">
					{$formData.type ? $formData.type : 'Select a verified type to display'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<!-- <Select.Label>Assessment Types</Select.Label> -->
						<Select.Item value="Survey" label="Survey">Survey</Select.Item>
						<Select.Item value="Questionnaire" label="Questionnaire">Questionnaire</Select.Item>
						<Select.Item value="TestPaper" label="TestPaper">Test Paper</Select.Item>
						<Select.Item value="DataCollection" label="DataCollection">Data Collection</Select.Item>
					</Select.Group>
				</Select.Content>
				<!-- <Select.Input name="type" /> -->
			</Select.Root>
		{/snippet}
		<!-- </div> -->
	</Form.Control>
	<Form.Description></Form.Description>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="currentVersion">
	<Form.Control>
		<!-- <div class="grid grid-cols-4 items-center gap-4"> -->
		{#snippet children({ props })}
			<Form.Label>currentVersion</Form.Label>
			<Input {...props} bind:value={$formData.currentVersion} />
		{/snippet}
		<!-- <Form.Label class="text-right">Current Version</Form.Label>
			<Input class="col-span-3" {...attrs} bind:value={$formData.currentVersion} /> -->
		<!-- </div> -->
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="defaultSectionNumbering">
	<Form.Control>
		<div class="flex flex-row gap-2">
			<Checkbox bind:checked={$formData.defaultSectionNumbering} />
			<div class="space-y-1 leading-none">
				<!-- <Form.Label>Default Section Numbering <span class="text-red-600">*</span></Form.Label>
				<Form.Description>This is for adding the default Numbering to sections</Form.Description> -->
				<Form.Label>Default Section Numbering </Form.Label>
				<!-- <Input {...props} bind:value={$formData.title} /> -->
			</div>
		</div>

		<input name="defaultSectionNumbering" value={$formData.defaultSectionNumbering} hidden />
	</Form.Control>
</Form.Field>
	<!-- <Form.Button type="submit" class="mx-auto mt-5 w-full">Submit</Form.Button> -->
<!-- <Form.Description>This is title of section.</Form.Description> -->
<!-- <Form.Description>This is Description for section.</Form.Description> -->
<!-- <Form.Description>This is parent section for section.</Form.Description> -->
<!-- <Form.Description>This is tenantCode for this assessment.</Form.Description> -->
<!-- <Form.Description>This is current version.</Form.Description> -->
<!-- </form>	 -->
