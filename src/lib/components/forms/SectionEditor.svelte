<script lang="ts">

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { sectionSchema, type SectionSchema } from './section-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import Icon from '@iconify/svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import InfoIcon from '../common/InfoIcon.svelte';

	let { formDataForForm }: { data: { form: SuperValidated<Infer<SectionSchema>> } } = $props();

	console.log(formDataForForm.form,"This is data from section form editor");
		// Initialize superForm
	const form = superForm(formDataForForm.form,{
		validators: zodClient(sectionSchema),
		applyAction: true,
		dataType: 'json'
	});

	const { form: formData, enhance } = form;
	///////////////////////////////////////////////////////////////


</script>

<!-- submit|preventDefault={handleSubmit} -->
<!-- <Card.Root class="rounded-lg border p-4"> -->
<form
	action="?/createSection"
	method="post"
	use:enhance
	class="custom-scrollbar mx-auto max-h-[90vh] w-[100vh] overflow-y-auto border-2 px-10 py-4 shadow-lg"
>
	<!-- <Card.Title>
			<div class="flex justify-end">
				<Button type="button" variant="destructive" size="icon">
					<Icon icon="iwwa:delete" width="16" height="16" />
				</Button>
			</div>
		</Card.Title> -->
	<Form.Field {form} name="id" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Id</Form.Label>
					<Input {...props} bind:value={$formData.id} />
				{/snippet}
			</Form.Control>
			<Form.Description>This is id of section.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<div class="relative mt-5 grid grid-cols-12 items-center gap-4">
					<Form.Label class="col-span-11 ">Title<span class="text-red-600">*</span></Form.Label>
					<div class="relative col-span-1">
						<!-- Replace div with a button and handle keyboard accessibility -->
						<InfoIcon title={'This is title of section.'} cls={'w-20'} />
					</div>
				</div>
				<Input {...props} bind:value={$formData.title} />
			{/snippet}
		</Form.Control>
		<!-- <Form.Description>This is title of section.</Form.Description> -->
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="parentSectionId" class="hidden">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Id</Form.Label>
				<Input {...props} />
			{/snippet}
		</Form.Control>
		<Form.Description>This is id of section.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="description">
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
				<Input {...props} bind:value={$formData.description} />
			{/snippet}
		</Form.Control>
		<!-- <Form.Description>This is Description for section.</Form.Description> -->
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="sectionIdentifier">
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
				<Input {...props} bind:value={$formData.sectionIdentifier} />
			{/snippet}
		</Form.Control>
		<!-- <Form.Description>This is Section identifier.</Form.Description> -->
		<Form.FieldErrors />
	</Form.Field>

	<!-- <Form.Field {form} name="sequence">
		<Form.Control let:attrs>
			<Form.Label>Sequence</Form.Label>
			<Input {...attrs} bind:value={$formData.sequence} />
		</Form.Control>
		<Form.Description>This is Sequence of section.</Form.Description>
		<Form.FieldErrors />
	</Form.Field> -->

	<Form.Button type="submit" class="mx-auto mt-5 w-full">Submit</Form.Button>
</form>

<!-- </Card.Root> -->

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
