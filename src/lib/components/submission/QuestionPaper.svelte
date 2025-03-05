<script>
	import FloatInteger from './FloatInteger.svelte';
	import SingleChoice from './SingleChoice.svelte';
	import Text from './Text.svelte';
	import File from './File.svelte';
	import MultipleChoices from './MultipleChoice.svelte';
	import DateTime from './Datetime.svelte';
	import Bool from './Boolean.svelte';
	import Range from './Range.svelte';
	import Rating from './Rating.svelte';

	/////////////////////////////////////////////////////////////////////////////////

	export let sections;
	export let questions;
	export let answers;
	// export let textValues

	const componentsMap = {
		Text: Text,
		Float: FloatInteger,
		Integer: FloatInteger,
		File: File,
		SingleChoiceSelection: SingleChoice,
		MultiChoiceSelection: MultipleChoices,
		DateTime: DateTime,
		Boolean: Bool,
		Range: Range,
		Rating: Rating
	};
</script>

{#each sections as s}
	<fieldset class="mt-2 border border-gray-400 p-2">
		<legend>{s.Title}</legend>
		{#each questions as q}
			{#if q.ParentFormSection.id === s.id}
				<div class=" mt-2">
					<svelte:component this={componentsMap[q.ResponseType]} {q} {answers} />
				</div>
			{/if}
		{/each}
	</fieldset>
{/each}
