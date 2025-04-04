<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class="space-y-2 rounded-lg px-4 pt-4">
	<div class="flex items-center justify-between">
		<Label for="title" class="text-sm"
			>{question.Title || 'Question Title'}
			{#if question.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		<Label for="score" class="text-sm font-medium"
			>{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
	</div>
	<Label for="title" class="text-xs text-gray-500">{question.Description || ''}</Label>
	<Input placeholder="Enter value here" disabled />

	<p class="text-end text-xs text-gray-400">
		{question.Hint ? `Hint: ${question.Hint}` : ''}
	</p>
</div>
