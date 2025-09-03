<script lang="ts">
	import * as Select from '../ui/select/index.js';
	import { Label } from '../ui/label/index.js';
	import { Input } from '../ui/input/index.js';
	import { Button } from '../ui/button/index.js';
	import Icon from '@iconify/svelte';
	import ExpressionBuilder from './ExpressionBuilder.svelte';
	// Self-import to support recursion (replaces deprecated <svelte:self>)
	import TreeNodeClean from './TreeNodeClean.svelte';

	// Props
	let {
		node,
		path = [] as number[],
		fields = [] as Array<{ id: string; Title?: string; DisplayCode?: string; ResponseType?: string }>,
		operators = [] as string[],
		// callbacks from parent to mutate tree state
		onAddLogical,
		onAddGroup = undefined,
		onRemove,
		onChangeGroupOperator,
		onChangeLeafField,
		onChangeLeafOperator,
		onChangeLeafValue,
		onChangeLeafName,
		onChangeExpression,
		errorsByPath = {} as Record<string, { field?: string; operator?: string; value?: string; name?: string }>,
		collapsedByPath = {} as Record<string, boolean>,
		onToggleCollapse,
		expressionsByPath = {} as Record<string, string>,
		readonly = false,
		// Mode controls
		showOnlyConditions = false,
		showOnlyOutcomes = false
	} = $props();

	// Determine if composite features are allowed based on presence of onAddGroup
	const allowComposite = !!onAddGroup;

	// Local mirror state to emit changes without mutating props directly
	let localGroupOperator = $state(node?.type === 'composite' ? node.operator : 'AND');

	// For logical leaf locals
	let localField = $state(node?.type !== 'composite' ? node?.condition?.field : '');
	let localOperator = $state(node?.type !== 'composite' ? node?.condition?.operator : '');
	let localValue = $state(node?.type !== 'composite' ? (node?.condition?.value as any) : '');
	let localName = $state(node?.type !== 'composite' ? (node?.condition as any)?.name || '' : '');

	// Add choice for dropdown
	let addChoice = $state('');

	// Helper functions
	function formatFieldTitle(title: string): string {
		if (!title) return '';
		return title
			.replace(/\s+/g, '-')
			.replace(/[^\w\-?.,!@#$%^&*()]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function getFieldDisplay(fieldId: string): string {
		const f = fields.find((x) => x.id === fieldId);
		const label = f?.Title || f?.DisplayCode || '';
		return formatFieldTitle(label);
	}

	function currentPathKey() {
		return path.join('-');
	}

	function getExpression(key: string): string {
		return expressionsByPath[key] || '';
	}

	function setExpression(key: string, value: string) {
		onChangeExpression?.(key, value);
	}

	// Reactive watchers to notify parent on local changes (copied from validation logic)
	let prevLocalGroup: 'AND' | 'OR' | undefined;
	let prevLocalField: string | undefined;
	let prevLocalOperator: string | undefined;
	let prevLocalValue: any;
	
	$effect(() => {
		if (!node) return;
		if (node.type === 'composite') {
			if (localGroupOperator !== prevLocalGroup) {
				prevLocalGroup = localGroupOperator;
				onChangeGroupOperator?.(path, localGroupOperator);
			}
		} else {
			if (localField !== prevLocalField) {
				prevLocalField = localField;
				onChangeLeafField?.(path, localField);
			}
			if (localOperator !== prevLocalOperator) {
				prevLocalOperator = localOperator;
				onChangeLeafOperator?.(path, localOperator);
				if (localOperator === 'Is Empty' || localOperator === 'Is Not Empty') {
					localValue = '';
				}
			}
			if (localValue !== prevLocalValue) {
				prevLocalValue = localValue;
				onChangeLeafValue?.(path, localValue);
			}
		}

		// Handle add action via dropdown (copied from validation logic)
		if (!readonly && addChoice) {
			if (addChoice === 'logical') {
				onAddLogical?.(path);
			} else if (addChoice === 'composite') {
				onAddGroup?.(path, localGroupOperator);
			}
			addChoice = '';
		}
	});
</script>

<!-- Exact copy of validation logic TreeNode structure -->
{#if node?.type === 'composite'}
	<div class="relative z-0 space-y-2">
		<!-- Group header -->
		<div
			class="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm"
			style={`margin-left:${path.length * 16}px`}
		>
			<div class="flex items-center gap-2 text-sm text-slate-700">
				<button
					type="button"
					class="rounded p-1 hover:bg-slate-100"
					onclick={() => onToggleCollapse?.(path)}
					title={collapsedByPath[path.join('-')] ? 'Expand' : 'Collapse'}
				>
					<Icon
						icon={collapsedByPath[path.join('-')] ? 'mdi:chevron-right' : 'mdi:chevron-down'}
						class="h-4 w-4 text-slate-600"
					/>
				</button>
				<Icon icon="mdi:source-branch" class="h-4 w-4 text-slate-500" />
				<span class="font-medium">{allowComposite ? 'Condition Group' : 'Conditions'}</span>
				{#if allowComposite}
					<div class="flex items-center gap-1">
						<Label class="text-xs text-slate-600">Operator</Label>
						{#if !readonly}
							<Select.Root type="single" bind:value={localGroupOperator}>
								<Select.Trigger class="w-20 text-xs">{localGroupOperator}</Select.Trigger>
								<Select.Content portalProps={{}}>
									<Select.Item value="AND" label="AND" />
									<Select.Item value="OR" label="OR" />
								</Select.Content>
							</Select.Root>
						{:else}
							<span class="text-xs text-slate-800">{localGroupOperator}</span>
						{/if}
					</div>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				{#if !readonly}
					{#if allowComposite}
						<Select.Root type="single" bind:value={addChoice}>
							<Select.Trigger class="w-40 text-xs">
								<Icon icon="mdi:plus" class="h-3 w-3 mr-1" /> Add...
							</Select.Trigger>
							<Select.Content portalProps={{}}>
								<Select.Item value="logical" label="Logical condition" />
								<Select.Item value="composite" label="Composite condition" />
							</Select.Content>
						</Select.Root>
					{:else}
						<Button type="button" variant="outline" size="sm" onclick={() => onAddLogical?.(path)} title="Add condition">
							<Icon icon="mdi:plus" class="h-3 w-3" /> Condition
						</Button>
					{/if}
					{#if path.length > 0 && allowComposite}
						<Button type="button" variant="destructive" size="sm" onclick={() => onRemove?.(path)}>
							<Icon icon="mdi:close" class="h-3 w-3" />
						</Button>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Children -->
		{#if !collapsedByPath[path.join('-')]}
			<div class="space-y-2">
				{#each node.children as child, i}
					<div class="relative" style={`margin-left:${(path.length + 1) * 16}px`}>
						<!-- connectors -->
						<div
							class="absolute -left-4 bottom-0 top-0 border-l border-slate-300"
							style="pointer-events:none"
						></div>
						<div
							class="absolute -left-4 top-3 h-0.5 w-4 bg-slate-300"
							style="pointer-events:none"
						></div>

						<TreeNodeClean
							node={child}
							path={[...path, i]}
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
							{onChangeExpression}
							{errorsByPath}
							{collapsedByPath}
							{onToggleCollapse}
							{expressionsByPath}
							{readonly}
							{showOnlyConditions}
							{showOnlyOutcomes}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- Logical leaf - exactly like validation logic -->
	<div class="relative z-10 rounded-md border bg-white p-3 shadow-sm">
		<div class="grid grid-cols-12 gap-3">
			<!-- Name -->
			<div class="col-span-12">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Condition Name (optional)</Label>
				{#if !readonly}
					<Input
						type="text"
						bind:value={localName}
						placeholder="Enter a condition name"
						class="w-full"
					/>
					{#if errorsByPath[currentPathKey()]?.name}
						<div class="mt-1 text-xs text-red-600">{errorsByPath[currentPathKey()].name}</div>
					{/if}
				{:else}
					<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
						{localName || '—'}
					</div>
				{/if}
			</div>
			<!-- Field -->
			<div class="col-span-5">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Field</Label>
				{#if !readonly}
					<Select.Root type="single" bind:value={localField}>
						<Select.Trigger class="w-full">
							{localField ? getFieldDisplay(localField) : 'Select a field'}
						</Select.Trigger>
						<Select.Content portalProps={{}}>
							{#each fields as f}
								<Select.Item value={f.id} label={formatFieldTitle(f.Title || f.DisplayCode)} />
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errorsByPath[currentPathKey()]?.field}
						<div class="mt-1 text-xs text-red-600">{errorsByPath[currentPathKey()].field}</div>
					{/if}
				{:else}
					<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
						{localField ? getFieldDisplay(localField) : '—'}
					</div>
				{/if}
			</div>

			<!-- Operator -->
			<div class="col-span-3">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Operator</Label>
				{#if !readonly}
					<Select.Root type="single" bind:value={localOperator}>
						<Select.Trigger class="w-full">{localOperator || 'Select Operator'}</Select.Trigger>
						<Select.Content portalProps={{}}>
							{#each operators as op}
								<Select.Item value={op} label={op} />
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errorsByPath[currentPathKey()]?.operator}
						<div class="mt-1 text-xs text-red-600">{errorsByPath[currentPathKey()].operator}</div>
					{/if}
				{:else}
					<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
						{localOperator || '—'}
					</div>
				{/if}
			</div>

			<!-- Value -->
			{#if localOperator !== 'Is Empty' && localOperator !== 'Is Not Empty'}
				<div class="col-span-3">
					<Label class="mb-1 block text-xs font-medium text-gray-700">Value</Label>
					{#if !readonly}
						<Input type="text" bind:value={localValue} placeholder="Enter value" class="w-full" />
						{#if errorsByPath[currentPathKey()]?.value}
							<div class="mt-1 text-xs text-red-600">{errorsByPath[currentPathKey()].value}</div>
						{/if}
					{:else}
						<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
							{localValue || '—'}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Remove -->
			<div class="col-span-1 flex items-end justify-end">
				{#if !readonly}
					<Button type="button" variant="destructive" size="sm" onclick={() => onRemove?.(path)}>
						<Icon icon="mdi:close" class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Expression builder section - only shown when showOnlyOutcomes is true -->
{#if showOnlyOutcomes}
	<div class="space-y-4">
		<ExpressionBuilder
			expression={getExpression('global')}
			onExpressionChange={(value) => setExpression('global', value)}
			{fields}
			placeholder="Enter the calculation expression..."
			size="default"
			showValidation={true}
			{readonly}
		/>
	</div>
{/if}

<style>
	:global(.border-slate-300) {
		border-color: rgb(203 213 225);
	}
</style>