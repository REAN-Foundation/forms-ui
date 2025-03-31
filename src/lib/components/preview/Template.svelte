<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Block from './basic/Block.svelte';
	import Template from './Template.svelte';

	let { sections } = $props();

	const getBackgroundClass = (index) => `bg-slate-${(index + 3) * 100}`;
</script>

{#each sections ?? [] as s, index}
	<!-- {#if s?.Sections?.length > 0 || s?.Questions?.length > 0} -->
	<fieldset class="mt-2 rounded-md border border-gray-400 bg-[#f9fafb] p-4 dark:bg-[#0a0a0b]">
		<legend class="mx-auto px-5">{s?.Title ?? 'Section Name'}</legend>

		{#each s?.Questions ?? [] as sq, index}
			<!-- <fieldset class="mt-2 border-2 p-2"> -->
			<!-- <legend class="mx-auto px-5">{sq?.Title ?? 'Question Title'} {index+1}</legend> -->
			<!-- <legend class="mx-auto px-5"></legend> -->
			<Block q={sq} />
			<!-- </fieldset> -->
		{/each}

		<!-- {#each s?.Subsections ?? [] as ss}
			<fieldset class="mt-2 p-2">
				<legend class="mx-auto px-5">{ss?.Title ?? 'Section Name'}</legend>

				{#each ss?.Questions ?? [] as sq}
					<fieldset class="mt-2 border-2 p-2">
						<legend class="mx-auto px-5">{sq?.Title ?? 'Question Title'}</legend>
						<Block q={sq} />
					</fieldset>
				{/each}
			</fieldset>
		{/each} -->
		<!-- <div class={`p-4 ${getBackgroundClass(index)}`}> -->

		{#if s?.Subsections?.length > 0}
			<Template sections={s?.Subsections} />
		{/if}
		<!-- </div> -->
		<!-- <Template {Subsections} /> -->
	</fieldset>
	<!-- {/if} -->
{/each}
