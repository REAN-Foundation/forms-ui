<script lang="ts">
	import Icon from '@iconify/svelte';

	// export let showTooltip;
	let showTooltip = false;
	export let title;
	export let cls;
</script>

<button
	type="button"
	class="tooltip-container relative focus:outline-none"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	onclick={() => (showTooltip = !showTooltip)}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ' ? (showTooltip = !showTooltip) : null)}
	aria-label="Show tooltip"
	aria-expanded={showTooltip}
	aria-describedby="tooltip-text"
>
	<Icon icon="carbon:information" width="16" height="16" />
</button>

{#if showTooltip}
	<div
		id="tooltip-text"
		class="{cls} absolute top-full mt-1 text-wrap rounded-lg border bg-primary p-2 text-xs text-white shadow-lg"
	>
		{title}
	</div>
{/if}
