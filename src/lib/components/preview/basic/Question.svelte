<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class=" w-full rounded-lg bg-white px-4 py-4">
	<div class="flex items-center justify-between">
		<div>
			<Label for="title" class=" text-sm"
				>{question.Title || 'Question Title'}
				{#if question.IsRequired}
					<span class="ml-1 text-red-600">*</span>
				{/if}
			</Label>
			<p class="mt-1 text-sm text-gray-500">{question.Description || ''}</p>
		</div>

		<Label for="score" class="float-right">{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
	</div>
	<Input disabled type={question.ResponseType} class="mt-2 " />
	<Label for="hint" class="mt-4 text-right text-xs text-gray-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</Label
	>
</div>
