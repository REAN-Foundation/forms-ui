<script lang="ts">
	import Icon from '@iconify/svelte';
	import TreeNode from './TreeNode.svelte';

	let {
		node,
		fields = [] as Array<{ id: string; Title?: string; DisplayCode?: string }>,
		operators = [] as string[],
		onAddLogical,
		onAddGroup,
		onRemove,
		onChangeGroupOperator,
		onChangeLeafField,
		onChangeLeafOperator,
		onChangeLeafValue,
		onChangeLeafName,
		collapsedByPath = {} as Record<string, boolean>,
		onToggleCollapse,
		title = 'Conditional Calculations',
		variant = 'calculation' // 'calculation' | 'default'
	} = $props();

	function countLogical(n: any): number {
		if (!n) return 0;
		if (n.type === 'logical') return 1;
		let c = 0;
		for (const child of n.children || []) c += countLogical(child);
		return c;
	}
	let totalConditions = $derived(countLogical(node));
</script>

<div
	class={variant === 'calculation'
		? 'mb-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-5 shadow-sm'
		: 'mb-4'}
>
	<div class="mb-4 flex items-center gap-2">
		<Icon
			icon="lucide:git-branch"
			class={variant === 'calculation' ? 'h-5 w-5 text-amber-700' : 'h-5 w-5 text-slate-700'}
		/>
		<h3
			class={variant === 'calculation'
				? 'font-semibold text-amber-800'
				: 'font-semibold text-slate-700'}
		>
			{title}
		</h3>
		<span
			class={variant === 'calculation'
				? 'rounded-full bg-amber-200 px-2 py-1 text-xs text-amber-800'
				: 'rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-800'}
		>
			{totalConditions} condition{totalConditions !== 1 ? 's' : ''}
		</span>
	</div>
	{#if variant === 'calculation'}
		<p class="mb-4 text-sm text-amber-700">
			Define different calculations based on field conditions. These will be evaluated before the
			main expression.
		</p>
	{/if}

	<TreeNode
		{node}
		path={[]}
		{fields}
		{operators}
		{onAddLogical}
		{onAddGroup}
		{onRemove}
		{onChangeGroupOperator}
		{onChangeLeafField}
		{onChangeLeafOperator}
		{onChangeLeafValue}
		{onChangeLeafName}
		{collapsedByPath}
		{onToggleCollapse}
	/>
</div>
