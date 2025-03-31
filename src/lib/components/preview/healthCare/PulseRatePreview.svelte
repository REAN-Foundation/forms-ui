<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class=" mt-4 w-full justify-between rounded-md border p-4 pb-10">
	<div>
		<Label for="title" class="text-md">{question.Title || 'Question Title'}</Label>
		<Label for="score" class="float-right">{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
		<br />
		<Label for="title" class="ml-2 text-xs">{question.Description || ''}</Label><br />
		<Input placeholder="Enter your Height " />
	</div>
	<Label for="hint" class="float-right ml-auto mt-4 text-xs text-slate-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</Label
	>
</div>