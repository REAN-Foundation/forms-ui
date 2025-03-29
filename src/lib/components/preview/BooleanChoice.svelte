<script lang="ts">
	import { Label } from '../ui/label';

	export let question;

	let optionsArray: string[] = [];

	$: if (question.Options && Array.isArray(question.Options) && question.Options.length > 0) {
		optionsArray = question.Options.map((option: { Text: any }) => option.Text);
	} else {
		optionsArray = ['Option 1', 'Option 2'];
	}
</script>

<div class=" mt-4 w-full justify-between rounded-md border p-4 pb-10">
	<div>
		<Label for="title" class="text-md">{question.Title || 'Question Title'}
			{#if question.IsRequired}
			<span class="text-red-600 ml-1">*</span>
			{/if}
		</Label>
		<Label for="score" class="float-right">{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
		<Label for="title" class="ml-2 text-xs">{question.Description || ''}</Label><br />

		<div class="pl-2 pt-2">
			{#each optionsArray as option, index}
				<div class="flex items-start justify-start">
					<input type="radio" disabled class="input mt-1" />
					<label for={`option${index}`} class="ml-2 font-serif text-sm text-slate-500"
						>{option}</label
					>
				</div>
			{/each}
		</div>
	</div>
	<Label for="hint" class="float-right ml-auto mt-4 text-xs text-slate-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</Label
	>
</div>
