<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import type { NameUpdateModel } from '../../../common/questionTypes';
	import { questionSchema } from '../../question-schema';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	//////////////////////////////////////////////////////////////////////////////

	let { questionCard = $bindable(), errors = $bindable(), handleQuestionCardUpdate } = $props();

	let state = $state({
		inputType: '',
		firstName: {
			visible: false,
			mandatory: false,
			label: ''
		},
		middleName: {
			visible: false,
			mandatory: false,
			label: ''
		},
		lastName: {
			visible: false,
			mandatory: false,
			label: ''
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		console.log(questionCard.Title);

		const model: NameUpdateModel = {
			id: questionCard.id,
			Title: questionCard.Title,
			Description: questionCard.Description,
			ResponseType: questionCard.ResponseType,
			IsRequired: questionCard.IsRequired,
			InputType: state.inputType,
			FirstName: state.firstName,
			MiddleName: state.middleName,
			LastName: state.lastName
		};

		// if (state.showFirstName) model.FirstName = state.firstName;
		// if (state.showMiddleName) model.MiddleName = state.middleName;
		// if (state.showLastName) model.LastName = state.lastName;

		const result = await questionSchema.safeParseAsync(model);
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
			console.log('Called handleQuestionCardUpdate');
			handleQuestionCardUpdate(model);
		}
	}
</script>

<Card.Root class=" rounded-none border-none bg-secondary p-4 ">
	<form
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2"
		onsubmit={(event) => {
			event.preventDefault();
			handleSubmit(event);
		}}
	>
		<Input bind:value={questionCard.id} class="hidden" />

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Title<span class="text-red-600">*</span></Label>
		</div>
		<Input bind:value={questionCard.Title} />
		<p class="text-destructive">{errors?.Title}</p>

		<div class="my-4">
			<Label class="mb-1 block">Input Type</Label>
			<select bind:value={state.inputType} class="w-full rounded-md border px-3 py-2 text-sm">
				<option value="" disabled selected>Select an input type</option>
				<option value="Characters">Anything</option>
				<option value="Characters">Characters</option>
				<option value="Characters and Numbers">Characters and Numbers</option>
				<option value="Characters, Numbers and Spaces">Characters, Numbers and Spaces</option>
				<option value="Characters, Numbers without Spaces"
					>Characters, Numbers without Spaces</option
				>
				<option value="Characters, Numbers and Symbols">Characters, Numbers and Symbols</option>
			</select>
		</div>

		<!-- First Name -->
		<div class="my-2 grid grid-cols-12 items-center gap-4">
			<label class="col-span-1 flex items-center justify-center">
				<input type="checkbox" bind:checked={state.firstName.visible} class="h-4 w-4" />
			</label>
			<Label class="col-span-2">First Name</Label>
			<input
				type="text"
				bind:value={state.firstName.label}
				placeholder="Label"
				disabled={!state.firstName.visible}
				class="col-span-6 rounded-md border px-3 py-2 text-sm disabled:opacity-50"
			/>
			<label class="col-span-2 flex items-center space-x-2">
				<input
					type="checkbox"
					bind:checked={state.firstName.mandatory}
					disabled={!state.firstName.visible}
					class="h-4 w-4"
				/>
				<span class="text-sm">Required</span>
			</label>
		</div>

		<!-- Middle Name -->
		<div class="my-2 grid grid-cols-12 items-center gap-4">
			<label class="col-span-1 flex items-center justify-center">
				<input type="checkbox" bind:checked={state.middleName.visible} class="h-4 w-4" />
			</label>
			<Label class="col-span-2">Middle Name</Label>
			<input
				type="text"
				bind:value={state.middleName.label}
				placeholder="Label"
				disabled={!state.middleName.visible}
				class="col-span-6 rounded-md border px-3 py-2 text-sm disabled:opacity-50"
			/>
			<label class="col-span-2 flex items-center space-x-2">
				<input
					type="checkbox"
					bind:checked={state.middleName.mandatory}
					disabled={!state.middleName.visible}
					class="h-4 w-4"
				/>
				<span class="text-sm">Required</span>
			</label>
		</div>

		<!-- Last Name -->
		<div class="my-2 grid grid-cols-12 items-center gap-4">
			<label class="col-span-1 flex items-center justify-center">
				<input type="checkbox" bind:checked={state.lastName.visible} class="h-4 w-4" />
			</label>
			<Label class="col-span-2">Last Name</Label>
			<input
				type="text"
				bind:value={state.lastName.label}
				placeholder="Label"
				disabled={!state.lastName.visible}
				class="col-span-6 rounded-md border px-3 py-2 text-sm disabled:opacity-50"
			/>
			<label class="col-span-2 flex items-center space-x-2">
				<input
					type="checkbox"
					bind:checked={state.lastName.mandatory}
					disabled={!state.lastName.visible}
					class="h-4 w-4"
				/>
				<span class="text-sm">Required</span>
			</label>
		</div>
		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Description</Label>
		</div>
		<Input bind:value={questionCard.Description} />
		<p class="text-destructive">{errors?.Description}</p>

		<div class="relative my-4 grid grid-cols-12 items-center gap-4">
			<div class="col-span-11 flex items-center space-x-2">
				<Label for="isRequired">Required</Label>
				<input
					id="isRequired"
					type="checkbox"
					bind:checked={questionCard.IsRequired}
					aria-labelledby="isRequired"
					class="h-4 w-4"
				/>
			</div>
		</div>
		<p class="text-destructive">{errors?.IsRequired}</p>

		<Input bind:value={questionCard.ResponseType} class="hidden" />

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11">Score</Label>
		</div>
		<Input bind:value={questionCard.Score} type="number" />
		<p class="text-destructive">{errors?.Score}</p>

		<Dialog.Footer class="mt-4">
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</form>
</Card.Root>

<!-- 
{
  id: '4b62189b-9949-41e4-a0e2-c91eab37dbf9',
  Title: 'Enter your Name',
  Description: null,
  ResponseType: 'Name',
  IsRequired: false,
  FirstName: {visible:true, mandatory:true, label:'Enter firstname'},
  MiddleName: {visible:false, mandatory:false, },
  LastName: {visible:true, mandatory:true, label:'Enter lastname'},
  InputType:'Characters'|'Characters and Numbers'|'Characters, Numbers and Spaces'|'Characters, Numbers without Spaces'|'Characters, Numbers and Symbols'
} -->

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 2px;
		height: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #d70c0c;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
