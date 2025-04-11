<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class=" w-full rounded-lg bg-white px-4 py-4">
	<div class="flex justify-between">
		<Label for="title" class=" text-sm"
			>{question.Title || 'Question Title'}
			{#if question.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		<Label for="score" class="text-sm font-medium"
			>{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
	</div>
	<Label class="mt-1 text-sm text-gray-500">{question.Description || ''}</Label>
	<Input disabled type={question.ResponseType} class="mt-2 " />
	<p class="text-right text-xs text-gray-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</p
	>
</div>
