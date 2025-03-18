<script lang="ts">
	import Icon from '@iconify/svelte';

	let { title, cls } = $props();
	// export let showTooltip;
	let showTooltip = $state(false);
	// export let title;
	// export let cls;
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
		class="{cls} text-container absolute right-3 top-full mt-1 h-auto rounded-lg border bg-primary p-2 text-xs text-white shadow-lg"
	>
		{title}
	</div>
{/if}

<style>
	.text-container {
		width: auto; /* Allows width to be variable */
		white-space: nowrap; /* Prevents text from breaking into multiple lines */
		overflow: hidden; /* Hides overflow text */
		text-overflow: ellipsis; /* Displays an ellipsis for trimmed text */
		display: -webkit-box; /* Makes it work with webkit browsers */
		-webkit-line-clamp: 2; /* Limits the text to 2 lines */
		-webkit-box-orient: vertical; /* Orients the box vertically */
	}
</style>
