<script lang="ts">
    import { Button } from '../ui/button/index.js';
    import { Input } from '../ui/input/index.js';
    import { Label } from '../ui/label/index.js';
    import * as Select from '../ui/select/index.js';
    import Icon from '@iconify/svelte';

    // Props
    let { isOpen = $bindable(false), onSave, onCancel, editingRule = null, questionList } = $props();

    // State for form data
    let ruleName = $state('Skip to checkout');
    
    // IF conditions
    let conditions = $state([
        { field: 'Customer Type', operator: 'Is', value: 'Premium', connector: 'AND' },
        { field: 'Age', operator: 'Greater Than', value: '18', connector: 'OR' }
    ]);

    // THEN actions
    let actions = $state([
        { actionType: 'Skip to Field', target: 'Payment Section' },
        { actionType: 'Hide Fields', target: 'Billing Address,Shipping Address' }
    ]);

    // Fallback action
    let fallbackAction = $state('Show All Fields');
    let fallbackTarget = $state('Default Behavior');

    // Available fields and operators
    const fields = ['Customer Type', 'Age', 'Country', 'Email', 'Phone', 'Income', 'Postal Code'];
    const operators = [
        'Is', 'Is Not', 'Contains', 'Does Not Contain', 'Greater Than', 'Less Than',
        'Greater Than or Equal', 'Less Than or Equal', 'Is Empty', 'Is Not Empty'
    ];
    const connectors = ['AND', 'OR'];
    const actionTypes = ['Skip to Field', 'Skip to Page', 'Skip to End', 'Hide Fields', 'Show Fields'];
    const targets = ['Payment Section', 'Contact Details', 'Address Information', 'Additional Questions', 'Thank You Page'];
    const fieldTargets = ['Billing Address', 'Shipping Address', 'Company Information', 'Tax Details', 'Emergency Contact'];
    const fallbackOptions = ['Show All Fields', 'Skip to Field', 'Skip to Page', 'Hide Fields'];

    // Initialize form data when editing an existing rule
    $effect(() => {
        if (editingRule) {
            ruleName = editingRule.ruleName || '';
            conditions = editingRule.conditions || [];
            actions = editingRule.actions || [];
            fallbackAction = editingRule.fallbackAction || 'Show All Fields';
            fallbackTarget = editingRule.fallbackTarget || 'Default Behavior';
        }
    });

    function addCondition() {
        conditions.push({ field: 'Select Field', operator: 'Is', value: '', connector: 'AND' });
    }

    function removeCondition(index: number) {
        conditions.splice(index, 1);
    }

    function addAction() {
        actions.push({ actionType: 'Skip to Field', target: 'Payment Section' });
    }

    function removeAction(index: number) {
        actions.splice(index, 1);
    }

    function handleSave(event) {
        event?.preventDefault();
        event?.stopPropagation();
        const skipLogicData = {
            ruleName,
            conditions,
            actions,
            fallbackAction,
            fallbackTarget
        };
        onSave?.(skipLogicData);
    }

    function handleCancel(event) {
        event?.preventDefault();
        event?.stopPropagation();
        onCancel?.();
    }
</script>

{#if isOpen}
    <!-- Modal Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
        <!-- Modal -->
        <div class="bg-white rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Modal Header -->
            <div class="bg-slate-700 text-white p-5 rounded-t-lg flex justify-between items-center">
                <h2 class="text-lg font-semibold">Skip Logic Builder</h2>
                <button type="button" class="text-white text-2xl p-1 hover:bg-slate-600 rounded" onclick={handleCancel}>
                    ×
                </button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-8">
                <!-- Rule Name -->
                <div class="mb-6">
                    <Label class="block mb-2 font-semibold text-slate-700">Rule Name</Label>
                    <Input 
                        bind:value={ruleName}
                        placeholder="Enter rule name"
                        class="w-full p-3 border-2 border-gray-200 rounded-md text-sm focus:border-blue-500"
                    />
                    <div class="text-xs text-gray-500 mt-1">(Maximum 100 characters)</div>
                </div>

                <!-- IF Section -->
                <div class="bg-gray-50 rounded-lg p-5 mb-5">
                    <div class="flex items-center mb-5">
                        <div class="bg-gray-600 text-white px-4 py-2 rounded font-semibold mr-4 min-w-[60px] text-center">
                            IF
                        </div>
                        <span>Define conditions to skip fields</span>
                    </div>

                    <!-- Grouping Controls -->
                    <div class="mb-4">
                        <Button type="button" variant="outline" size="sm" class="mr-2">
                            <Icon icon="lucide:layers" class="h-3 w-3 mr-1" />
                            Group Conditions
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                            <Icon icon="lucide:plus" class="h-3 w-3 mr-1" />
                            Add Group
                        </Button>
                    </div>

                    <!-- Conditions -->
                    <div class="border-2 border-gray-200 rounded-md p-4 mb-4 bg-white">
                        {#each conditions as condition, index}
                            <div class="flex items-center gap-2 mb-4">
                                <Select.Root type="single" name="FieldToValidate" bind:value={condition.field}>
                                    <Select.Trigger class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm">
                                        {condition.field || 'Select Field'}
                                    </Select.Trigger>
                                    <Select.Content>
                                        <Select.Item value="Select Field">Select Field</Select.Item>
                                        {#each fields as field}
                                            <Select.Item value={field}>{field}</Select.Item>
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                                
                                <Select.Root type="single" name="Operator" bind:value={condition.operator}>
                                    <Select.Trigger class="min-w-[120px] px-3 py-2 border border-gray-300 rounded text-sm">
                                        {condition.operator}
                                    </Select.Trigger>
                                    <Select.Content>
                                        {#each operators as operator}
                                            <Select.Item value={operator}>{operator}</Select.Item>
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                                
                                <Input 
                                    bind:value={condition.value}
                                    placeholder="Enter value"
                                    class="min-w-[150px] px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                
                                <Button 
                                    type="button"
                                    onclick={() => removeCondition(index)}
                                    variant="destructive"
                                    size="sm"
                                    class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                >
                                    Remove
                                </Button>
                            </div>

                            {#if index < conditions.length - 1}
                                <div class="flex items-center justify-center my-2">
                                    <Select.Root type="single" name="Connector" bind:value={condition.connector}>
                                        <Select.Trigger class="px-3 py-1 border border-gray-300 rounded bg-gray-200 font-semibold">
                                            {condition.connector}
                                        </Select.Trigger>
                                        <Select.Content>
                                            {#each connectors as connector}
                                                <Select.Item value={connector}>{connector}</Select.Item>
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                </div>
                            {/if}
                        {/each}

                        <Button 
                            type="button"
                            onclick={addCondition}
                            class="bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1 hover:bg-green-700"
                        >
                            <Icon icon="lucide:plus" class="h-4 w-4" />
                            Add Condition
                        </Button>
                    </div>
                </div>

                <!-- THEN Section -->
                <div class="bg-gray-50 rounded-lg p-5 mb-5">
                    <div class="flex items-center mb-5">
                        <div class="bg-gray-600 text-white px-4 py-2 rounded font-semibold mr-4 min-w-[60px] text-center">
                            THEN
                        </div>
                        <span>Define skip actions</span>
                    </div>

                    <div class="border-2 border-gray-200 rounded-md p-4 mb-4 bg-white">
                        {#each actions as action, index}
                            <div class="flex items-center gap-2 mb-4">
                                <Select.Root type="single" name="ActionType" bind:value={action.actionType}>
                                    <Select.Trigger class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm">
                                        {action.actionType}
                                    </Select.Trigger>
                                    <Select.Content>
                                        {#each actionTypes as actionType}
                                            <Select.Item value={actionType}>{actionType}</Select.Item>
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                                
                                {#if action.actionType === 'Hide Fields' || action.actionType === 'Show Fields'}
                                    <Select.Root type="single" name="FieldTargets" bind:value={action.target}>
                                        <Select.Trigger class="min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm" style="height: 100px;">
                                            {action.target || 'Select Fields'}
                                        </Select.Trigger>
                                        <Select.Content>
                                            {#each fieldTargets as fieldTarget}
                                                <Select.Item value={fieldTarget}>{fieldTarget}</Select.Item>
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                {:else}
                                    <Select.Root type="single" name="Target" bind:value={action.target}>
                                        <Select.Trigger class="min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm">
                                            {action.target}
                                        </Select.Trigger>
                                        <Select.Content>
                                            {#each targets as target}
                                                <Select.Item value={target}>{target}</Select.Item>
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                {/if}
                                
                                <Button 
                                    type="button"
                                    onclick={() => removeAction(index)}
                                    variant="destructive"
                                    size="sm"
                                    class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                >
                                    Remove
                                </Button>
                            </div>
                        {/each}

                        <Button 
                            type="button"
                            onclick={addAction}
                            class="bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1 hover:bg-green-700"
                        >
                            <Icon icon="lucide:plus" class="h-4 w-4" />
                            Add Action
                        </Button>
                    </div>
                </div>

                <!-- Fallback Section -->
                <div class="bg-yellow-50 border border-yellow-300 rounded-md p-4 mt-5">
                    <div class="font-semibold text-yellow-800 mb-2">Fallback Rule (Optional)</div>
                    <div class="flex items-center gap-2">
                        <Select.Root type="single" name="FallbackAction" bind:value={fallbackAction}>
                            <Select.Trigger class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm">
                                {fallbackAction}
                            </Select.Trigger>
                            <Select.Content>
                                {#each fallbackOptions as option}
                                    <Select.Item value={option}>{option}</Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                        
                        <Select.Root type="single" name="FallbackTarget" bind:value={fallbackTarget}>
                            <Select.Trigger class="min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm">
                                {fallbackTarget}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="Default Behavior">Default Behavior</Select.Item>
                                {#each targets as target}
                                    <Select.Item value={target}>{target}</Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-8 py-5 border-t border-gray-200 flex justify-end gap-2">
                <Button 
                    type="button"
                    onclick={handleCancel}
                    variant="outline"
                    class="px-6 py-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-100"
                >
                    Cancel
                </Button>
                <Button 
                    type="button"
                    onclick={handleSave}
                    class="px-6 py-3 bg-slate-700 text-white rounded-md text-sm font-semibold hover:bg-slate-800"
                >
                    Save Rule
                </Button>
            </div>
        </div>
    </div>
{/if} 