<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import InfoIcon from '../common/InfoIcon.svelte';
	import { Label } from '../ui/label';
	import { enhance } from '$app/forms';
	import { sectionSchema } from './section-schema';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let { sectionData, closeSectionForm, errors = $bindable(), handleSectionUpdate } = $props();
	console.log(errors);
	///////////////////////////////////////////////////////////////

	async function handleSubmit(event) {
		event.preventDefault();

		const model = {
			id: sectionData.id,
			ParentSectionId: sectionData.ParentSectionId,
			Title: sectionData.Title,
			Description: sectionData.Description,
			SectionIdentifier: sectionData.SectionIdentifier
		};

		console.log(model);

		const result = await sectionSchema.safeParseAsync(model);
		if (!result.success) {
			console.log('client side validation error', result.error.flatten().fieldErrors);
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
		}

		if (Object.keys(errors).length === 0 || result?.success) {
			handleSectionUpdate(model);
		}
	}
</script>

<Card.Root class=" rounded-md ">
	<div class=" bg-secondary text-black items-center p-4 rounded-tr-md rounded-tl-md">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Edit Section</h2>
			<Button type="button" variant="ghost" size="icon" onclick={closeSectionForm}>
				<Icon icon="mdi:close" class="text-gray-600 " />
			</Button>
		</div>
		<p class=" text-sm">Make changes to your section here. Click save when you're done.</p>
	</div>

	<form
		method="post"
		use:enhance
		class="custom-scrollbar mx-auto max-h-[90vh] w-[100vh] overflow-y-auto px-6 py-4"
	>
		<!-- <Card.Title>
			<div class="flex justify-end  ">
				<Button type="button" variant="destructive" size="icon" onclick={closeSectionForm}>
					<Icon icon="iwwa:delete"  />
				</Button>
			</div>
		</Card.Title> -->

		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is id of section.'} cls={'w-20'} />
			</div>
		</div>
		<Input bind:value={sectionData.id} class="hidden" />

		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">ParentSectionId<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is ParentSectionId for section.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={sectionData.ParentSectionId} class="hidden" />

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is title of section.'} cls={'w-20'} />
			</div>
		</div>
		<Input bind:value={sectionData.Title} />
		<p class="text-destructive">{errors?.Title}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description</Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={sectionData.Description} />
		<p class="text-destructive">{errors?.Description}</p>

		<!-- <div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Section Identifier<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				
				<InfoIcon title={'This is Section Identifier for section.'} cls={'text-primary'} />
			</div>
		</div> -->
		<Input class="hidden" bind:value={sectionData.SectionIdentifier} disabled/>
		<p class="text-destructive">{errors?.SectionIdentifier}</p>

		<Dialog.Footer class="mt-4">
			<Button onclick={handleSubmit} type="submit">Save changes</Button>
		</Dialog.Footer>
	</form>
</Card.Root>

<style>
	.custom-scrollbar {
		overflow-y: auto;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 0;
		background: transparent;
	}

	.custom-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: transparent;
	}
	/* .tooltip-container {
		cursor: pointer;
	} */
</style>
