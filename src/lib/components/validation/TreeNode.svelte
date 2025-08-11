<script lang="ts">
	import * as Select from '../ui/select/index.js';
	import { Label } from '../ui/label/index.js';
	import { Input } from '../ui/input/index.js';
	import { Button } from '../ui/button/index.js';
	import Icon from '@iconify/svelte';
	// Self-import to support recursion (replaces deprecated <svelte:self>)
	import TreeNode from './TreeNode.svelte';

	// Props
	let {
		node,
		path = [] as number[],
		fields = [] as Array<{ id: string; Title?: string; DisplayCode?: string }>,
		operators = [] as string[],
		// callbacks from parent to mutate tree state
		onAddLogical,
		onAddGroup,
		onRemove,
		onChangeGroupOperator,
		onChangeLeafField,
		onChangeLeafOperator,
		onChangeLeafValue,
		collapsedByPath = {} as Record<string, boolean>,
		onToggleCollapse
	} = $props();

    // Local mirror state to emit changes without mutating props directly
    let localGroupOperator = $state(node?.type === 'composite' ? node.operator : 'AND');

    // For logical leaf locals
    let localField = $state(node?.type !== 'composite' ? node?.condition?.field : '');
    let localOperator = $state(node?.type !== 'composite' ? node?.condition?.operator : '');
    let localValue = $state(node?.type !== 'composite' ? (node?.condition?.value as any) : '');

    // keep locals in sync when parent updates node (one-way with guards)
    let isLocalEdit = $state(false);
    $effect(() => {
        if (isLocalEdit) return; // don't overwrite while user is editing locally
        if (node?.type === 'composite') {
            if (localGroupOperator !== node.operator) {
                localGroupOperator = node.operator;
            }
        } else if (node) {
            if (localField !== node.condition.field) {
                localField = node.condition.field;
            }
            if (localOperator !== node.condition.operator) {
                localOperator = node.condition.operator;
            }
            const nextVal = node.condition.value as any;
            if (localValue !== nextVal) {
                localValue = nextVal;
            }
        }
    });

    // emit changes to parent when locals differ from node (guarded to avoid loops)
    let isEmitting = $state(false);
    $effect(() => {
        if (!node || isEmitting) return;
        if (node.type === 'composite') {
            if (localGroupOperator !== node.operator) {
                isEmitting = true;
                onChangeGroupOperator?.(path, localGroupOperator);
                queueMicrotask(() => {
                    isEmitting = false;
                    isLocalEdit = false;
                });
            }
        } else {
            if (localField && localField !== node.condition.field) {
                isEmitting = true;
                onChangeLeafField?.(path, localField);
                queueMicrotask(() => {
                    isEmitting = false;
                    isLocalEdit = false;
                });
                return;
            }
            if (localOperator && localOperator !== node.condition.operator) {
                isEmitting = true;
                onChangeLeafOperator?.(path, localOperator);
                queueMicrotask(() => {
                    isEmitting = false;
                    isLocalEdit = false;
                });
                return;
            }
            const nodeVal = (node.condition.value as any) ?? '';
            const localVal = (localValue as any) ?? '';
            if (localVal !== nodeVal) {
                isEmitting = true;
                onChangeLeafValue?.(path, localValue);
                queueMicrotask(() => {
                    isEmitting = false;
                    isLocalEdit = false;
                });
            }
        }
    });

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
	<div class="space-y-2">
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
				<span class="font-medium">Composite</span>
                <div class="flex items-center gap-1">
					<Label class="text-xs text-slate-600">Operator</Label>
                    <Select.Root type="single" bind:value={localGroupOperator}>
                        <Select.Trigger class="w-20 text-xs">{localGroupOperator}</Select.Trigger>
						<Select.Content>
							<Select.Item value="AND">AND</Select.Item>
							<Select.Item value="OR">OR</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="flex items-center gap-2">
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
			</div>
		</div>

		<!-- Children -->
		{#if !collapsedByPath[path.join('-')]}
			<div class="space-y-2">
				{#each node.children as child, i}
					<div class="relative" style={`margin-left:${(path.length + 1) * 16}px`}>
						<!-- connectors -->
						<div class="absolute -left-4 bottom-0 top-0 border-l border-slate-300"></div>
						<div class="absolute -left-4 top-3 h-0.5 w-4 bg-slate-300"></div>

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
							{collapsedByPath}
							{onToggleCollapse}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- Logical leaf -->
	<div class="rounded-md border bg-white p-3 shadow-sm">
		<div class="grid grid-cols-12 gap-3">
			<!-- Field -->
			<div class="col-span-5">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Field</Label>
                <Select.Root type="single" bind:value={localField}>
                    <Select.Trigger class="w-full">
                        {localField ? getFieldDisplay(localField) : 'Select a field'}
					</Select.Trigger>
					<Select.Content>
						{#each fields as f}
							<Select.Item value={f.id}>{formatFieldTitle(f.Title || f.DisplayCode)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Operator -->
			<div class="col-span-3">
				<Label class="mb-1 block text-xs font-medium text-gray-700">Operator</Label>
                <Select.Root type="single" bind:value={localOperator}>
                    <Select.Trigger class="w-full">{localOperator || 'Select Operator'}</Select.Trigger>
					<Select.Content>
						{#each operators as op}
							<Select.Item value={op}>{op}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Value -->
            {#if localOperator !== 'Is Empty' && localOperator !== 'Is Not Empty'}
				<div class="col-span-3">
                    <Label class="mb-1 block text-xs font-medium text-gray-700">Value</Label>
                    <Input type="text" bind:value={localValue} placeholder="Enter value" class="w-full" />
				</div>
			{/if}

			<!-- Remove -->
			<div class="col-span-1 flex items-end justify-end">
				<Button type="button" variant="destructive" size="sm" onclick={() => onRemove?.(path)}>
					<Icon icon="mdi:close" class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.border-slate-300) {
		border-color: rgb(203 213 225);
	}
</style>
