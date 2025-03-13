<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import InfoIcon from '../common/InfoIcon.svelte';
	import { Label } from '../ui/label';
	import { enhance } from '$app/forms';

	let { sectionData, handleCancel, closeModel } = $props();

	///////////////////////////////////////////////////////////////

	async function handleSubmit() {
		console.log(sectionData.Title);

		const model = {
			id: sectionData.id,
			parentSectionId: sectionData.ParentSectionId,
			title: sectionData.Title,
			description: sectionData.Description,
			sectionIdentifier: sectionData.SectionIdentifier
		};
		const response = await fetch(`/api/server/section`, {
			method: 'PUT',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		const section = await response.json();
		console.log(section);
		if (section.HttpCode === 200) {
			closeModel('Section', section);
		}
	}
</script>

<Card.Root class="rounded-lg border p-4">
	<form
		method="post"
		use:enhance
		class="custom-scrollbar mx-auto max-h-[90vh] w-[100vh] overflow-y-auto border-2 px-10 py-4 shadow-lg"
	>
		<Card.Title>
			<div class="flex justify-end">
				<Button type="button" variant="destructive" size="icon" onclick={handleCancel}>
					<Icon icon="iwwa:delete" width="16" height="16" />
				</Button>
			</div>
		</Card.Title>

		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is id of section.'} cls={'w-20'} />
			</div>
		</div>
		<Input bind:value={sectionData.id} class="hidden" />

		<div class="relative mt-5 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">ParentSectionId<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is ParentSectionId for section.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={sectionData.ParentSectionId} class="hidden" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is title of section.'} cls={'w-20'} />
			</div>
		</div>
		<Input bind:value={sectionData.Title} required minlength="8" maxlength="256" />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={sectionData.Description} />

		<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Section Identifier<span class="text-red-600">*</span></Label>
			<div class="relative col-span-1">
				<!-- Replace div with a button and handle keyboard accessibility -->
				<InfoIcon title={'This is Section Identifier for section.'} cls={'text-primary'} />
			</div>
		</div>
		<Input bind:value={sectionData.SectionIdentifier} />

		<!-- <Form.Field {form} name="id" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Id</Form.Label>
					<Input {...props} bind:value={sectionData.id} required />
				{/snippet}
			</Form.Control>
			<Form.Description>This is id of section.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="parentSectionId" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>ParentSectionId</Form.Label>
					<Input {...props} bind:value={sectionData.ParentSectionId} required />
				{/snippet}
			</Form.Control>
			<Form.Description>This is id of section.</Form.Description>
			<Form.FieldErrors />
		</Form.Field> -->

		<!-- <Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
						<Form.Label class="col-span-11 ">Title<span class="text-red-600">*</span></Form.Label>
						<div class="relative col-span-1">
							<InfoIcon title={'This is title of section.'} cls={'w-20'} />
						</div>
					</div>
					<Input {...props} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field> -->
		<!-- <Form.Description>This is title of section.</Form.Description> -->
		<!-- Replace div with a button and handle keyboard accessibility -->

		<!-- <Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
						<Form.Label class="col-span-11 "
							>Description <span class="text-red-600">*</span></Form.Label
						>
						<div class="relative col-span-1">
							<InfoIcon title={'This is Description for section.'} cls={'text-primary'} />
						</div>
					</div>
					<Input {...props} bind:value={sectionData.Description} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field> -->
		<!-- <Form.Description>This is Description for section.</Form.Description> -->

		<!-- <Form.Field {form} name="sectionIdentifier">
			<Form.Control>
				{#snippet children({ props })}
					<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
						<Form.Label class="col-span-11 "
							>Section Identifier <span class="text-red-600">*</span></Form.Label
						>
						<div class="relative col-span-1">
							<InfoIcon title={'This is Section Identifier for section.'} cls={'text-primary'} />
						</div>
					</div>
					<Input {...props} bind:value={sectionData.SectionIdentifier} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field> -->
		<!-- <Form.Description>This is Section identifier.</Form.Description> -->

		<!-- <Form.Field {form} name="sequence">
		<Form.Control let:attrs>
			<Form.Label>Sequence</Form.Label>
			<Input {...attrs} bind:value={$formData.sequence} />
		</Form.Control>
		<Form.Description>This is Sequence of section.</Form.Description>
		<Form.FieldErrors />
	</Form.Field> -->

		<Button type="submit" class="mx-auto mt-5 w-full" onclick={handleSubmit}>Submit</Button>
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
