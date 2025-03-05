<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';

	export let option;
	console.log(option);
	let options: any[] = [];

	function addOption() {
		options = [...options, ''];
	}

	function updateOption(index: number, value: string) {
		options[index] = value;
		options = [...options];
	}

	function removeOption(index: number) {
		options = options.filter((_, i) => i !== index);
	}
</script>

<Button type="button" onclick={addOption} class="btn btn-primary mb-4">Add Option</Button>

{#each options as option, index}
	<div class="mb-2 flex items-center">
		<Input
			type="text"
			name={`options[${index}]`}
			value={option}
			oninput={(e) => updateOption(index, e.target.value)}
			placeholder={`Option ${index + 1}`}
			class="flex-1"
		/>
		<button type="button" onclick={() => removeOption(index)} class="ml-2">
			<Icon icon="mingcute:delete-2-line" width="25" height="25" style="color: black" />
		</button>
	</div>
{/each}

<input type="hidden" name="options" value={options} />
