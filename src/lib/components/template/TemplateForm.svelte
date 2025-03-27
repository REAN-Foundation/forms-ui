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

	let { templateData, errors = $bindable() } = $props();
	console.log(errors);
	///////////////////////////////////////////////////////////////

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
</script>

<Dialog.Root>
	<Dialog.Trigger class="{buttonVariants({ variant: 'default' })} my-2 w-28 md:ml-auto">
		Add New
	</Dialog.Trigger>
	<Dialog.Content class=" max-w-[50vh] sm:max-w-[50vh] md:max-w-[70vh] xl:max-w-[100vh] ">
		<Dialog.Header>
			<Dialog.Title>Add New</Dialog.Title>
			<Dialog.Description>
				Make changes to your Assessment Template here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/newAssessment" use:enhance>
			<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon title={'This is id of section.'} cls={'w-20'} />
				</div>
			</div>
			<Input bind:value={templateData.id} class="hidden" />

			<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon title={'This is Title for section.'} cls={'text-primary'} />
				</div>
			</div>
			<Input bind:value={templateData.Title} class="hidden" />

			<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon title={'This is title of section.'} cls={'w-20'} />
				</div>
			</div>
			<Input bind:value={templateData.Title} />
			<p class="text-destructive">{errors?.Title}</p>

			<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Description</Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
				</div>
			</div>
			<Input bind:value={templateData.Description} />
			<p class="text-destructive">{errors?.Description}</p>

			<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">TenantCode</Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon title={'This is Section TenantCode for section.'} cls={'text-primary'} />
				</div>
			</div>
			<Input bind:value={templateData.TenantCode} />
			<p class="text-destructive">{errors?.TenantCode}</p>

			<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">CurrentVersion</Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
				</div>
			</div>
			<Input bind:value={templateData.CurrentVersion} />
			<p class="text-destructive">{errors?.CurrentVersion}</p>

			<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">DefaultSectionNumbering</Label>
				<div class="relative col-span-1">
					<!-- Replace div with a button and handle keyboard accessibility -->
					<InfoIcon
						title={'This is Section DefaultSectionNumbering for section.'}
						cls={'text-primary'}
					/>
				</div>
			</div>
			<Input bind:value={templateData.DefaultSectionNumbering} disabled />
			<p class="text-destructive">{errors?.DefaultSectionNumbering}</p>

			<!-- <Button type="submit" class="mx-auto mt-5 w-full">Submit</Button> -->
			<Dialog.Footer>
				<Button type="submit">Save changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
