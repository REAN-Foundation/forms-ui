<script lang="ts">
	import Block from './Block.svelte';
	import Template from './Template.svelte';

	let { sections } = $props();

	const getBackgroundClass = (index) => `bg-slate-${(index + 3) * 100}`;
</script>

{#each sections ?? [] as s, index}
	<!-- {#if s?.Sections?.length > 0 || s?.Questions?.length > 0} -->
	<div class="my-2 border py-6 px-4 border-gray-400 rounded-md  dark:bg-[#0a0a0b]  ">
		<h1 class=" font-semibold text-lg px-4 text-left">{s?.Title ?? 'Section Name'}</h1>
	<fieldset class="mt-2 rounded-md border border-gray-400 p-4 dark:bg-[#0a0a0b]">
		<legend class=" px-4 text-left">{s?.Title ?? 'Section Name'}</legend>

		{#each s?.Questions ?? [] as sq, index}
			<Block q={sq} />
		{/each}

		{#if s?.Subsections?.length > 0}
			<Template sections={s?.Subsections} />
		{/if}
		<!-- </div> -->
		<!-- <Template {Subsections} /> -->
	</div>
	<!-- {/if} -->
	</fieldset>
{/each}
