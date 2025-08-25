<script lang="ts">
	import { toastMessage } from '../toast/toast.store.js';
	import LogicTreePanel from '../logic-tree/LogicTreePanel.svelte';
	// Props: access to tree state, handlers and API helpers via parent
	let {
		treeRoot,
		fields = [],
		operators = [],
		collapsedByPath = {},
		onAddLogical,
		onAddGroup,
		onRemove,
		onChangeGroupOperator,
		onChangeLeafField,
		onChangeLeafOperator,
		onChangeLeafValue,
		onChangeLeafName,
		onToggleCollapse,
		ensureCalculationLogic,
		createOperationsForNode,
		pruneTree,
		createCalculationRule,
		linkLogicToField
	} = $props();
	export function save() {
		return doSave();
	}
	function doSave() {
		const pruned = pruneTree(treeRoot);
		if (!pruned) {
			toastMessage({ Message: 'Please add at least one valid condition', HttpCode: 400 });
			throw new Error('Please add at least one valid condition');
		}
		return (async () => {
			const logicId = await ensureCalculationLogic();
			const conditionOpId = await createOperationsForNode(pruned);
			await createCalculationRule(logicId, conditionOpId);
			await linkLogicToField(logicId);
		})();
	}
</script>

<LogicTreePanel
	node={treeRoot}
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
	title="Conditional Calculations"
	variant="default"
/>
