<script lang="ts">
	import { fly } from 'svelte/transition';
	import FielEditorForm from '../forms/FieldEditor.svelte';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

	let { formDataForForm, questionCard, closeSheet, handleSubmitForm } = $props();
	console.log(formDataForForm, 'this is pageData');
</script>

<div class="relative">
	<button
		class="blur-background fixed inset-0 z-40 bg-black bg-opacity-10 backdrop-blur-sm"
		onclick={() => closeSheet()}
		onkeydown={(e) => e.key === 'Escape' && closeSheet()}
		aria-label="Close sheet"
	></button>

	<div
		class="custom-scrollbar fixed right-0 top-0 z-50 h-full min-h-screen w-[46%] overflow-y-auto rounded-sm shadow-lg"
		in:fly={{ x: 500, duration: 500 }}
		out:fly={{ x: 500, duration: 500 }}
		role="dialog"
		aria-modal="true"
	>
		<div class="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4">
			<h2 class="text-md text-white">Form Title</h2>
			<Button type="button" variant="destructive" onclick={() => closeSheet()}>
				<Icon icon="hugeicons:cancel-01" width="15" height="15" />
			</Button>
		</div>
		<!-- {JSON.stringify(questionCard)} -->

		<FielEditorForm handleSubmit={handleSubmitForm} {questionCard} {formDataForForm} />
		<!-- <QuestionForm
			{id}
			{responseType}
			{questionCard}
			handleSubmit={handleSubmitForm}
		/> -->
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 1px;
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
