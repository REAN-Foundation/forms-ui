<script lang="ts">
	import { Label } from '../../ui/label';

	let { question } = $props();

	let optionsArray: string[] = $state();

	if (question.Options && Array.isArray(question.Options) && question.Options.length > 0) {
		optionsArray = question.Options.map((option: { Text: any }) => option.Text);
	} else {
		optionsArray = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
	}
</script>

<div class=" w-full rounded-lg border-gray-300  px-4 py-4">
	<div class="flex justify-between">
		<Label for="title" class="text-sm "
			>{question.Title || 'Question Title'}
			{#if question.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>

		<Label for="score" class=" text-sm font-medium"
			>{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
	</div>
	<Label class="my-0.5 text-sm text-gray-500">{question.Description || ''}</Label>

	<div class=" mt-2 space-y-1">
		{#each optionsArray as option, index}
			<div class="flex items-center space-x-3">
				<input type="radio" class="h-3 w-3 border-gray-300" disabled />
				<label for={`option${index}`} class=" font-serif text-sm text-slate-500">{option}</label>
			</div>
		{/each}
	</div>
	<p class="text-right text-xs text-gray-500">{question.Hint ? `Hint: ${question.Hint}` : ''}</p>
</div>
