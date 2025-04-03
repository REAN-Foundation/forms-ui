<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class=" my-2 w-full justify-between rounded-md px-4 py-4 ">
	<div>
		<Label for="title" class="text-sm">{question.Title || 'Question Title'}
			{#if question.IsRequired}
			<span class="text-red-600 ml-1">*</span>
			{/if}
		</Label>
		<Label for="score" class="float-right">{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
		<br />
		<Label for="title" class="ml-2 text-xs">{question.Description || ''}</Label><br />
		<Input placeholder="Enter value here " disabled/>
	</div>
	<Label for="hint" class="float-right ml-auto mt-4 text-xs text-slate-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</Label
	>
</div>
