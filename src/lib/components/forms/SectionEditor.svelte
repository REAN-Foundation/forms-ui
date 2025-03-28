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

<Card.Root class=" rounded-md bg-[#fafaf9] py-4 dark:bg-[#0a0a0b]  ">
	<div class="flex items-center justify-between px-6">
		<h2 class="text-xl font-semibold">Edit Section</h2>
		<Button type="button" variant="ghost" size="icon" onclick={closeSectionForm}>
			<Icon icon="mdi:close" class="text-gray-600 " />
		</Button>
	</div>

	<p class="px-6 text-sm text-gray-500">
		Make changes to your Section Template here. Click save when you're done.
	</p>
	<form
		method="post"
		use:enhance
		class="custom-scrollbar mx-auto max-h-[90vh] w-[100vh] overflow-y-auto px-6 py-4"
	>
		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1"></div>
		</div>
		<Input bind:value={sectionData.id} class="hidden" />

		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">ParentSectionId<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1"></div>
		</div>
		<Input bind:value={sectionData.ParentSectionId} class="hidden" />

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1"></div>
		</div>
		<Input bind:value={sectionData.Title} />
		<p class="text-destructive">{errors?.Title}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description</Label>
			<div class="relative col-span-1"></div>
		</div>
		<Input bind:value={sectionData.Description} />
		<p class="text-destructive">{errors?.Description}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Section Identifier</Label>
			<div class="relative col-span-1"></div>
		</div>
		<Input bind:value={sectionData.SectionIdentifier} disabled />
		<p class="text-destructive">{errors?.SectionIdentifier}</p>

		<Dialog.Footer class="mt-4">
			<Button type="submit">Save changes</Button>
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
