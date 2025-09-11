<script lang="ts">
    import { Button } from '../ui/button/index.js';
    import { Input } from '../ui/input/index.js';
    import { Label } from '../ui/label/index.js';
    import * as Select from '../ui/select/index.js';
    import Icon from '@iconify/svelte';
    import TreeNodeClean from '../calculation-logic/TreeNodeClean.svelte';
    import {
        getAllFields,
        getCurrentOperators,
        addLogicalToTree as addLogical,
        addGroupToTree as addGroup,
        removeNodeFromTree as removeNode,
        updateGroupOperatorInTree as updateGroupOperator,
        updateLeafFieldInTree as updateLeafField,
        updateLeafOperatorInTree as updateLeafOperator,
        updateLeafValueInTree as updateLeafValue,
        updateLeafNameInTree as updateLeafName,
        toggleCollapseForPath as toggleCollapse,
        createOperationsFromTree,
        updateLogicalOperation
    } from '../calculation-logic/service.js';
    import { toastMessage } from '../toast/toast.store.js';

    // Props
    let {
        isOpen = $bindable(false),
        onSave,
        onCancel,
        editingRule = null,
        questionList,
        currentField
    } = $props();

    // State - config
    let ruleName = $state('');
    let ruleDescription = $state('');
    let useConditionalLogic = $state(true);
    let conditionMode = $state<'logical' | 'composite'>('composite');
    let defaultSkip = $state(false);

    // THEN actions UI parity (visual only)
    let actions = $state<Array<{ actionType: string; target: string }>>([]);
    const actionTypes = ['Skip to Field', 'Skip to Page', 'Skip to End', 'Hide Fields', 'Show Fields'];
    const targets = ['Payment Section', 'Contact Details', 'Address Information', 'Additional Questions', 'Thank You Page'];
    const fieldTargets = ['Billing Address', 'Shipping Address', 'Company Information', 'Tax Details', 'Emergency Contact'];
    function addAction() {
        actions.push({ actionType: 'Skip to Field', target: 'Payment Section' });
    }
    function removeAction(index: number) {
        actions.splice(index, 1);
    }

    // Fallback UI selection (mapped to DefaultSkip internally)
    let fallbackAction = $state('Show All Fields');
    let fallbackTarget = $state('Default Behavior');

    // State - logical mode
    let logicalConditionName = $state('');
    let logicalConditionField = $state('');
    let logicalConditionOperator = $state('Equal To');
    let logicalConditionValue = $state('');

    // State - composite mode
    let tree = $state<any>({ type: 'composite', operator: 'AND', children: [] });
    let collapsed = $state({} as Record<string, boolean>);

    // Editing init (kept minimal for now)
    $effect(() => {
        if (editingRule) {
            ruleName = editingRule?.Name || '';
            ruleDescription = editingRule?.Description || '';
        }
    });

    // Helpers
    function validate(): string | null {
        if (!ruleName.trim()) return 'Rule name is required';
        if (!useConditionalLogic) return null;
        if (conditionMode === 'logical') {
            if (!logicalConditionField || !logicalConditionOperator) return 'Condition is incomplete';
        } else {
            if (!tree?.children || tree.children.length === 0) return 'Please add at least one condition';
        }
        return null;
    }

    // API helpers
    async function ensureSkipLogic(): Promise<string> {
        if (!currentField?.id) throw new Error('Missing field id');
        const res = await fetch('/api/server/logic/skip-logic', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ FieldId: currentField.id, Enabled: true, DefaultSkip: defaultSkip })
        });
        const data = await res.json();
        if (!res.ok || !data?.Data?.id) throw new Error(data?.Message || 'Failed to create skip logic');
        const logicId = data.Data.id as string;

        // Link to field
        await fetch('/api/server/form-fields', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: currentField.id, SkipLogicId: logicId })
        });
        return logicId;
    }

    async function createSkipRule(params: { logicId: string; operationType: string; operationId: string; }) {
        const payload = {
            Name: ruleName || 'Skip Rule',
            Description: ruleDescription || 'Skip rule',
            Priority: 1,
            IsActive: true,
            OperationType: params.operationType,
            OperationId: params.operationId,
            SkipWhenTrue: true,
            LogicId: params.logicId
        };
        const res = await fetch('/api/server/rules/skip-rule', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const d = await res.json();
            throw new Error(d?.Message || 'Failed to create skip rule');
        }
    }

    async function handleSave(e?: Event) {
        e?.preventDefault();
        e?.stopPropagation();
        const err = validate();
        if (err) {
            toastMessage({ Message: err, HttpCode: 400 });
            return;
        }

        try {
            // Map fallback UI to DefaultSkip flag
            defaultSkip = fallbackAction !== 'Show All Fields';

            // Step 1: ensure skip logic and link
            const logicId = await ensureSkipLogic();

            // Step 2: create or update condition operation
            let operationType = 'Logical';
            let operationId = '';
            if (useConditionalLogic) {
                if (conditionMode === 'logical') {
                    operationType = 'Logical';
                    operationId = await updateLogicalOperation(
                        null,
                        {
                            field: logicalConditionField,
                            operator: logicalConditionOperator,
                            value: logicalConditionValue,
                            name: logicalConditionName
                        },
                        ruleName,
                        ruleDescription,
                        questionList
                    );
                } else {
                    operationType = 'Composition';
                    operationId = await createOperationsFromTree(tree, ruleName, ruleDescription, questionList);
                }
            }

            // Step 3: create skip rule
            await createSkipRule({ logicId, operationType, operationId });

            toastMessage({ Message: 'Skip rule created', HttpCode: 200 });
            onSave?.({ created: true });
            isOpen = false;
        } catch (error: any) {
            toastMessage({ Message: error.message || 'Failed to save skip rule', HttpCode: 400 });
        }
    }

    function handleCancel(event?: Event) {
        event?.preventDefault();
        event?.stopPropagation();
        onCancel?.();
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
        <div class="bg-white rounded-lg w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="bg-slate-700 text-white p-5 rounded-t-lg flex justify-between items-center">
                <h2 class="text-lg font-semibold">Skip Logic Builder</h2>
                <button type="button" class="text-white text-2xl p-1 hover:bg-slate-600 rounded" onclick={handleCancel}>
                    ×
                </button>
            </div>
            
            <div class="p-6 space-y-6">
                <!-- Rule Meta -->
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label class="mb-1 block text-sm font-medium text-slate-700">Rule name</Label>
                        <Input bind:value={ruleName} placeholder="Enter rule name" class="w-full" />
                        <div class="text-[12px] text-gray-500 mt-1">(Maximum 100 characters)</div>
                    </div>
                    <div>
                        <Label class="mb-1 block text-sm font-medium text-slate-700">Description (optional)</Label>
                        <Input bind:value={ruleDescription} placeholder="Description" class="w-full" />
                    </div>
                </div>

                <!-- IF Section -->
                <div class="rounded-lg border border-gray-200 p-4">
                    <div class="mb-4 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="bg-gray-700 text-white px-3 py-1 rounded text-xs font-semibold">IF</div>
                            <span class="text-sm text-slate-700">Define when to skip this field</span>
                        </div>
                        <div class="flex items-center gap-6">
                            <label class="flex items-center gap-2 text-sm">
                                <input type="radio" name="condMode" value="logical" bind:group={conditionMode} />
                                Logical
                            </label>
                            <label class="flex items-center gap-2 text-sm">
                                <input type="radio" name="condMode" value="composite" bind:group={conditionMode} />
                                Composite
                            </label>
                        </div>
                    </div>

                    <!-- Grouping Controls (visual parity) -->
                    <div class="mb-4 flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm">
                            <Icon icon="lucide:layers" class="h-3 w-3 mr-1" /> Group Conditions
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                            <Icon icon="lucide:plus" class="h-3 w-3 mr-1" /> Add Group
                        </Button>
                    </div>

                    {#if conditionMode === 'logical'}
                        <div class="grid grid-cols-12 gap-3">
                            <div class="col-span-12">
                                <Label class="mb-1 block text-xs font-medium text-gray-700">Condition Name (optional)</Label>
                                <Input bind:value={logicalConditionName} placeholder="Enter a condition name" />
                            </div>
                            <div class="col-span-5">
                                <Label class="mb-1 block text-xs font-medium text-gray-700">Field</Label>
                                <Select.Root type="single" bind:value={logicalConditionField}>
                                    <Select.Trigger class="w-full">
                                        {logicalConditionField ? getAllFields(questionList).find(f => f.id === logicalConditionField)?.Title || 'Select a field' : 'Select a field'}
                                    </Select.Trigger>
                                    <Select.Content>
                                        {#each getAllFields(questionList) as f}
                                            <Select.Item value={f.id} label={f.Title || f.DisplayCode} />
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                            </div>
                            <div class="col-span-3">
                                <Label class="mb-1 block text-xs font-medium text-gray-700">Operator</Label>
                                <Select.Root type="single" bind:value={logicalConditionOperator}>
                                    <Select.Trigger class="w-full">{logicalConditionOperator}</Select.Trigger>
                                    <Select.Content>
                                        {#each getCurrentOperators(logicalConditionField, questionList) as op}
                                            <Select.Item value={op} label={op} />
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                            </div>
                            {#if logicalConditionOperator !== 'Is Empty' && logicalConditionOperator !== 'Is Not Empty'}
                                <div class="col-span-3">
                                    <Label class="mb-1 block text-xs font-medium text-gray-700">Value</Label>
                                    <Input bind:value={logicalConditionValue} placeholder="Enter value" />
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <TreeNodeClean
                            node={tree}
                            path={[]}
                            fields={getAllFields(questionList)}
                            operators={getCurrentOperators('', questionList)}
                            onAddLogical={(p) => { tree = addLogical(tree, p); }}
                            onAddGroup={(p, op) => { tree = addGroup(tree, p, op); }}
                            onRemove={(p) => { tree = removeNode(tree, p); }}
                            onChangeGroupOperator={(p, op) => { tree = updateGroupOperator(tree, p, op); }}
                            onChangeLeafField={(p, v) => { tree = updateLeafField(tree, p, v); }}
                            onChangeLeafOperator={(p, v) => { tree = updateLeafOperator(tree, p, v); }}
                            onChangeLeafValue={(p, v) => { tree = updateLeafValue(tree, p, v); }}
                            onChangeLeafName={(p, v) => { tree = updateLeafName(tree, p, v); }}
                            onChangeExpression={() => {}}
                            errorsByPath={{}}
                            collapsedByPath={collapsed}
                            onToggleCollapse={(p) => { collapsed = toggleCollapse(collapsed, p); }}
                            expressionsByPath={{}}
                            readonly={false}
                            showOnlyConditions={true}
                        />
                    {/if}
                </div>

                <!-- THEN Section (visual parity) -->
                <div class="rounded-lg border border-gray-200 p-4">
                    <div class="mb-4 flex items-center gap-2">
                        <div class="bg-gray-700 text-white px-3 py-1 rounded text-xs font-semibold">THEN</div>
                        <span class="text-sm text-slate-700">Define skip actions</span>
                    </div>
                    <div class="space-y-3">
                        {#each actions as action, index}
                            <div class="flex flex-wrap items-center gap-2">
                                <Select.Root type="single" bind:value={action.actionType}>
                                    <Select.Trigger class="min-w-[200px]">{action.actionType}</Select.Trigger>
                                    <Select.Content>
                                        {#each actionTypes as t}
                                            <Select.Item value={t} label={t} />
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                                {#if action.actionType === 'Hide Fields' || action.actionType === 'Show Fields'}
                                    <Select.Root type="single" bind:value={action.target}>
                                        <Select.Trigger class="min-w-[200px]">{action.target || 'Select Fields'}</Select.Trigger>
                                        <Select.Content>
                                            {#each fieldTargets as t}
                                                <Select.Item value={t} label={t} />
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                {:else}
                                    <Select.Root type="single" bind:value={action.target}>
                                        <Select.Trigger class="min-w-[200px]">{action.target}</Select.Trigger>
                                        <Select.Content>
                                            {#each targets as t}
                                                <Select.Item value={t} label={t} />
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                {/if}
                                <Button type="button" variant="destructive" size="sm" onclick={() => removeAction(index)}>
                                    Remove
                                </Button>
                            </div>
                        {/each}
                        <Button type="button" onclick={addAction} class="bg-green-600 text-white">
                            <Icon icon="lucide:plus" class="h-4 w-4 mr-1" /> Add Action
                        </Button>
                    </div>
                </div>

                <!-- Fallback Section (visual parity) -->
                <div class="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                    <div class="mb-2 font-medium text-yellow-900">Fallback Rule (Optional)</div>
                    <div class="flex flex-wrap items-center gap-2">
                        <Select.Root type="single" bind:value={fallbackAction}>
                            <Select.Trigger class="min-w-[200px]">{fallbackAction}</Select.Trigger>
                            <Select.Content>
                                <Select.Item value="Show All Fields" label="Show All Fields" />
                                <Select.Item value="Skip to Field" label="Skip to Field" />
                                <Select.Item value="Skip to Page" label="Skip to Page" />
                                <Select.Item value="Hide Fields" label="Hide Fields" />
                            </Select.Content>
                        </Select.Root>
                        <Select.Root type="single" bind:value={fallbackTarget}>
                            <Select.Trigger class="min-w-[200px]">{fallbackTarget}</Select.Trigger>
                            <Select.Content>
                                <Select.Item value="Default Behavior" label="Default Behavior" />
                                {#each targets as t}
                                    <Select.Item value={t} label={t} />
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <div class="flex justify-end gap-2">
                    <Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
                    <Button type="button" onclick={handleSave} class="bg-slate-700 text-white">Save Rule</Button>
                </div>
            </div>
        </div>
    </div>
{/if} 