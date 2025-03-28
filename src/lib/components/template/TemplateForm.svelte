<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import InfoIcon from '../common/InfoIcon.svelte';
	import { Label } from '../ui/label';
	import { enhance } from '$app/forms';
	import { assessmentSchema } from './assessment-schema';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	let { templateData, errors = $bindable() } = $props();

	///////////////////////////////////////////////////////////////
	$inspect(templateData, 'ghcfszdgvbjkn');
	// async function handleSubmit(event) {
	// 	event.preventDefault();

	// 	const model = {
	// 		id: sectionData.id,
	// 		ParentSectionId: sectionData.ParentSectionId,
	// 		Title: sectionData.Title,
	// 		Description: sectionData.Description,
	// 		SectionIdentifier: sectionData.SectionIdentifier
	// 	};

	// 	console.log(model);

	// 	const result = await sectionSchema.safeParseAsync(model);
	// 	if (!result.success) {
	// 		console.log('client side validation error', result.error.flatten().fieldErrors);
	// 		errors = Object.fromEntries(
	// 			Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
	// 				key,
	// 				val?.[0] || ''
	// 			])
	// 		);
	// 	}

	// 	if (Object.keys(errors).length === 0 || result?.success) {
	// 		handleSectionUpdate(model);
	// 	}
	// }

	const types = [
		{ value: 'Survey', label: 'Survey' },
		{ value: 'Questionnaire', label: 'Questionnaire' },
		{ value: 'TestPaper', label: 'Test Paper' },
		{ value: 'DataCollection', label: 'Data Collection' }
	];

	let typeValue = $state(templateData.Type);
	const selectedTypeValue = $derived(
		types.find((f) => f.value === typeValue)?.label ?? 'Select a Type of Template'
	);

	const itemsPerPage = [
		{ value: 'AllQuestions', label: 'All Questions' },
		{ value: 'OneQuestion', label: 'One Question' },
		{ value: 'OneSection', label: 'OneSection' }
	];

	let itemsPerPageValue = $state(templateData.ItemsPerPage);
	const selectedItemsPerPage = $derived(
		itemsPerPage.find((f) => f.value === itemsPerPageValue)?.label ?? 'Select a fruit'
	);
</script>

<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
	<div class="relative col-span-1">
		<!-- Replace div with a button and handle keyboard accessibility -->
		<InfoIcon title={'This is id of section.'} cls={'w-20'} />
	</div>
</div>
<Input name="id" bind:value={templateData.id} class="hidden" />

<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
	<div class="relative col-span-1">
		<!-- Replace div with a button and handle keyboard accessibility -->
		<InfoIcon title={'This is title of section.'} cls={'w-20'} />
	</div>
</div>
<Input name="Title" bind:value={templateData.Title} />
<p class="text-destructive">{errors?.Title}</p>

<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">Description</Label>
	<div class="relative col-span-1">
		<!-- Replace div with a button and handle keyboard accessibility -->
		<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
	</div>
</div>
<Input name="Description" bind:value={templateData.Description} />
<p class="text-destructive">{errors?.Description}</p>

<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">TenantCode</Label>
	<div class="relative col-span-1">
		<!-- Replace div with a button and handle keyboard accessibility -->
		<InfoIcon title={'This is Section TenantCode for section.'} cls={'text-primary'} />
	</div>
</div>
<Input name="TenantCode" bind:value={templateData.TenantCode} />
<p class="text-destructive">{errors?.TenantCode}</p>

<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">CurrentVersion</Label>
	<div class="relative col-span-1">
		<!-- Replace div with a button and handle keyboard accessibility -->
		<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
	</div>
</div>
<Input name="CurrentVersion" bind:value={templateData.CurrentVersion} />
<p class="text-destructive">{errors?.CurrentVersion}</p>

<!-- Replace div with a button and handle keyboard accessibility -->
<!-- <div class="relative mt-5 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">DefaultSectionNumbering</Label>
				<div class="relative col-span-1">
					<InfoIcon
						title={'This is Section DefaultSectionNumbering for section.'}
						cls={'text-primary'}
					/>
				</div>
			</div>
			<Input
				type="checkbox"
				name="DefaultSectionNumbering"
				bind:value={templateData.DefaultSectionNumbering}
				disabled
			/>
			<p class="text-destructive">{errors?.DefaultSectionNumbering}</p> -->

<Label class="text-right" for="ItemsPerPage">Select Type <span class="text-red-600">*</span></Label>
<Select.Root type="single" name="Type" bind:value={typeValue}>
	<Select.Trigger class="w-full">
		{selectedTypeValue}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.GroupHeading>Types</Select.GroupHeading>
			{#each types as type (type.value)}
				<Select.Item value={type.value} label={type.label} />
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>

<Label class="text-right" for="ItemsPerPage"
	>Select Items per page <span class="text-red-600">*</span></Label
>
<Select.Root type="single" name="ItemsPerPage" bind:value={itemsPerPageValue}>
	<Select.Trigger class="w-full">
		{selectedItemsPerPage}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.GroupHeading>Types</Select.GroupHeading>
			{#each itemsPerPage as items (items.value)}
				<Select.Item value={items.value} label={items.label} />
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>

<!-- <Select.Root type="single" bind:value={templateData.ItemsPerPage} name="ItemsPerPage">
				<Select.Trigger class="col-span-3">
					{templateData.ItemsPerPage
						? templateData.ItemsPerPage
						: 'Select a verified ItemsPerPage to display'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="AllQuestions" label="All Questions">All Questions</Select.Item>
						<Select.Item value="OneQuestion" label="1 Question" disabled>1 Question</Select.Item>
						<Select.Item value="OneSection" label="1 Section" disabled>1 Section</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root> -->

<!-- <Label class="text-right" for="Type">Type <span class="text-red-600">*</span></Label>
			<Select.Root type="single" bind:value={templateData.Type} name="Type">
				<Select.Trigger class="col-span-3">
					{templateData.Type ? templateData.Type : 'Select a verified type to display'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="Survey" label="Survey">Survey</Select.Item>
						<Select.Item value="Questionnaire" label="Questionnaire">Questionnaire</Select.Item>
						<Select.Item value="TestPaper" label="TestPaper">Test Paper</Select.Item>
						<Select.Item value="DataCollection" label="DataCollection">Data Collection</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root> -->

<!-- <Button type="submit" class="mx-auto mt-5 w-full">Submit</Button> -->
