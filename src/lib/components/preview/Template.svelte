<script lang="ts">
	import Block from './Block.svelte';
	import Template from './Template.svelte';

	let { sections } = $props();

	const getBackgroundClass = (index) => `bg-slate-${(index + 3) * 100}`;
</script>

{#each sections ?? [] as s, index}
	<!-- {#if s?.Sections?.length > 0 || s?.Questions?.length > 0} -->
	<fieldset class="my-2 rounded-md border  border-gray-400 px-2 pt-2  dark:bg-[#0a0a0b]">
		<legend class=" px-4 py-4 text-center text-lg font-semibold">{s?.Title ?? 'Section Name'}</legend>

		{#each s?.Questions ?? [] as sq, index}
			<Block q={sq} />
		{/each}

		{#if s?.Subsections?.length > 0}
			<Template sections={s?.Subsections} />
		{/if}
		<!-- </div> -->
		<!-- <Template {Subsections} /> -->
	</fieldset>
	<!-- {/if} -->
{/each}
