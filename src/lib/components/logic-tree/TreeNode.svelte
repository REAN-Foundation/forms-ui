<script lang="ts">
	import * as Select from '../ui/select/index.js';
	import { Label } from '../ui/label/index.js';
	import { Input } from '../ui/input/index.js';
	import { Button } from '../ui/button/index.js';
	import Icon from '@iconify/svelte';
	import TreeNode from './TreeNode.svelte';

	let {
		node,
		path = [] as number[],
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
		readonly = false
	} = $props();

	let localGroupOperator = $state(node?.type === 'composite' ? node.operator : 'AND');
	let localField = $state(node?.type !== 'composite' ? node?.condition?.field : '');
	let localOperator = $state(node?.type !== 'composite' ? node?.condition?.operator : '');
	let localValue = $state(node?.type !== 'composite' ? (node?.condition?.value as any) : '');
	let localName = $state(node?.type !== 'composite' ? (node?.condition as any)?.name || '' : '');

	function selectGroupOperator(val: 'AND' | 'OR') {
		localGroupOperator = val;
		onChangeGroupOperator?.(path, val);
	}
	function selectField(id: string) {
		localField = id;
		onChangeLeafField?.(path, id);
	}
	function selectOperator(op: string) {
		localOperator = op as any;
		onChangeLeafOperator?.(path, op);
		if (op === 'Is Empty' || op === 'Is Not Empty') localValue = '';
	}
	function changeValue(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		localValue = target?.value ?? '';
		onChangeLeafValue?.(path, localValue as any);
	}
	function changeName(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		localName = target?.value ?? '';
		onChangeLeafName?.(path, localName as any);
	}

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
</script>

{#if node?.type === 'composite'}
	<div class="relative z-0 space-y-2">
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
				<span class="font-medium">Composite</span>
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
			</div>
			<div class="flex items-center gap-2">
				{#if !readonly}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => onAddLogical?.(path)}
						title="Add condition"
					>
						<Icon icon="mdi:plus" class="h-3 w-3" /> Condition
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => onAddGroup?.(path, localGroupOperator)}
						title="Add subgroup"
					>
						<Icon icon="mdi:plus" class="h-3 w-3" /> Group
					</Button>
					{#if path.length > 0}
						<Button type="button" variant="destructive" size="sm" onclick={() => onRemove?.(path)}>
							<Icon icon="mdi:close" class="h-3 w-3" />
						</Button>
					{/if}
				{/if}
			</div>
		</div>

		{#if !collapsedByPath[path.join('-')]}
			<div class="space-y-2">
				{#each node.children as child, i}
					<div class="relative" style={`margin-left:${(path.length + 1) * 16}px`}>
						<div
							class="absolute -left-4 bottom-0 top-0 border-l border-slate-300"
							style="pointer-events:none"
						></div>
						<div
							class="absolute -left-4 top-3 h-0.5 w-4 bg-slate-300"
							style="pointer-events:none"
						></div>

						<TreeNode
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
							{collapsedByPath}
							{onToggleCollapse}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="relative z-10 rounded-md border bg-white p-3 shadow-sm">
		<div class="grid grid-cols-12 gap-3">
			<div class="col-span-12">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Condition Name</Label
				>
				{#if !readonly}
					<Input
						type="text"
						bind:value={localName}
						placeholder="Enter condition name"
						class="w-full"
						oninput={changeName}
					/>
				{:else}
					<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
						{localName || '—'}
					</div>
				{/if}
			</div>
			<div class="col-span-5">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Field</Label>
				{#if !readonly}
					<Select.Root type="single" bind:value={localField}>
						<Select.Trigger class="w-full"
							>{localField ? getFieldDisplay(localField) : 'Select a field'}</Select.Trigger
						>
						<Select.Content portalProps={{}}>
							{#each fields as f}
								<Select.Item value={f.id} label={formatFieldTitle(f.Title || f.DisplayCode)} />
							{/each}
						</Select.Content>
					</Select.Root>
				{:else}
					<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
						{localField ? getFieldDisplay(localField) : '—'}
					</div>
				{/if}
			</div>
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
				{:else}
					<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
						{localOperator || '—'}
					</div>
				{/if}
			</div>
			{#if localOperator !== 'Is Empty' && localOperator !== 'Is Not Empty'}
				<div class="col-span-3">
					<Label class="mb-1 block text-xs font-medium text-gray-700">Value</Label>
					{#if !readonly}
						<Input type="text" bind:value={localValue} placeholder="Enter value" class="w-full" />
					{:else}
						<div class="rounded border bg-gray-50 px-2 py-1 text-sm text-slate-800">
							{localValue || '—'}
						</div>
					{/if}
				</div>
			{/if}
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

<style>
	:global(.border-slate-300) {
		border-color: rgb(203 213 225);
	}
	/* Using a utility-like class name requires escaping the dot in Svelte's CSS; stick to global utility naming via Tailwind instead. */
</style>
