<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '../ui/label';
	import * as Select from '$lib/components/ui/select/index.js';
	
	///////////////////////////////////////////////////////////////
	let { templateData, errors = $bindable() } = $props();
	
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
		itemsPerPage.find((f) => f.value === itemsPerPageValue)?.label ?? 'Select a Items Per Page'
	);
</script>

<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
</div>
<Input name="id" bind:value={templateData.id} class="hidden" />

<div class="relative my-2 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
</div>
<Input name="Title" bind:value={templateData.Title} />
<p class="text-destructive">{errors?.Title}</p>

<div class="relative my-2 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">Description</Label>
</div>
<Input name="Description" bind:value={templateData.Description} />
<p class="text-destructive">{errors?.Description}</p>

<div class="relative my-2 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">TenantCode</Label>
</div>
<Input name="TenantCode" bind:value={templateData.TenantCode} />
<p class="text-destructive">{errors?.TenantCode}</p>

<div class="relative my-2 grid grid-cols-12 items-center gap-4">
	<Label class="col-span-11 ">CurrentVersion</Label>
</div>
<Input name="CurrentVersion" bind:value={templateData.CurrentVersion} type="number" />

<Label class=" text-right" for="ItemsPerPage">Select Type <span class="text-red-600">*</span></Label
>
<Select.Root type="single" name="Type" bind:value={typeValue}>
	<Select.Trigger class="w-full my-2">
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

<Label class="text-right " for="ItemsPerPage"
	>Select Items per page <span class="text-red-600">*</span></Label
>
<Select.Root type="single" name="ItemsPerPage" bind:value={itemsPerPageValue}>
	<Select.Trigger class="w-full my-2">
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


