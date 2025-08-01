<script lang="ts">
	import { toastMessage } from '../toast/toast.store.js';
    import { Button } from '../ui/button/index.js';
    import SkipLogicBuilderFull from './SkipLogicBuilderFull.svelte';
    import Icon from '@iconify/svelte';

    // Props
    let { fieldId, fieldName, onSkipLogicSaved, questionCard, questionList } = $props();

    // State
    let showBuilder = $state(false);
    let skipLogicRules = $state([]);
    let editingRule = $state(null);

    // Initialize skip logic rules from backend data
    $effect(() => {
        if (questionCard?.SkipLogic?.Rules) {
            skipLogicRules = questionCard.SkipLogic.Rules.map(rule => ({
                id: rule.id,
                ruleName: rule.Name,
                conditions: rule.Operation?.Operands || [],
                actions: rule.Operation?.Actions || [],
                operator: rule.Operation?.Operator || '',
                fieldReference: rule.Operation?.FieldReference || '',
                value: rule.Operation?.Value || '',
                createdAt: rule.CreatedAt
            }));
        }
    });

    function openBuilder(event, rule = null) {
        event?.preventDefault();
        event?.stopPropagation();
        editingRule = rule;
        showBuilder = true;
    }

    function closeBuilder(event) {
        event?.preventDefault();
        event?.stopPropagation();
        showBuilder = false;
        editingRule = null;
    }

    async function handleSave(skipLogicData) {
        if (editingRule) {
            // Update existing rule
            const index = skipLogicRules.findIndex(rule => rule.id === editingRule.id);
            if (index !== -1) {
                skipLogicRules[index] = {
                    ...skipLogicRules[index],
                    ...skipLogicData,
                    id: editingRule.id,
                    createdAt: editingRule.createdAt
                };
            }
        } else {
            // Add the new rule to our list
            const response = await fetch(`/api/server/logic/skip-logic`, {
					method: 'POST',
					body: JSON.stringify({
						FieldId: fieldId,
						Enabled: true
					}),
					headers: { 'content-type': 'application/json' }
				});
				const skipLogicData = await response.json();
				toastMessage(skipLogicData);
				console.log('SkipLogicData: ', skipLogicData);
        }

        // Call the parent callback if provided
        if (onSkipLogicSaved) {
            onSkipLogicSaved(skipLogicData);
        }

        // Close the builder
        closeBuilder(null);
    }

    function removeRule(index, event) {
        event?.preventDefault();
        event?.stopPropagation();
        skipLogicRules.splice(index, 1);
    }
</script>

<!-- Skip Logic Section -->
<div class="my-4 rounded-lg border border-gray-200 p-3 bg-gray-50">
    <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <h4 class="flex items-center gap-1 text-sm font-semibold text-gray-800">
                <Icon icon="lucide:skip-forward" class="h-3 w-3" />
                Skip Logic
            </h4>
            {#if skipLogicRules.length > 0}
                <span class="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border">
                    {skipLogicRules.length} rule{skipLogicRules.length !== 1 ? 's' : ''}
                </span>
            {/if}
        </div>
        <Button type="button" variant="outline" size="sm" onclick={(e) => openBuilder(e)} class="h-7 px-2 text-xs">
            <Icon icon="lucide:plus" class="h-3 w-3 mr-1" />
            Add Rule
        </Button>
    </div>
    
    {#if skipLogicRules.length > 0}
        <div class="space-y-2 max-h-48 overflow-y-auto">
            {#each skipLogicRules as rule, index}
                <div class="rounded border border-gray-200 bg-white p-2 text-xs">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-gray-800 truncate">{rule.ruleName}</div>
                            <div class="text-gray-600">
                                IF: <span class="font-medium">{rule.conditions.length} condition(s)</span>
                            </div>
                            <div class="text-gray-600">
                                THEN: <span class="font-medium">{rule.actions.length} action(s)</span>
                            </div>
                            {#if rule.conditions.length > 0}
                                <div class="text-gray-500 text-xs mt-1">
                                    {rule.operator} {rule.fieldReference} {rule.value}
                                    {#if rule.conditions.length > 1}
                                        <span class="text-gray-400"> +{rule.conditions.length - 1} more</span>
                                    {/if}
                                </div>
                            {/if}
                            {#if rule.actions.length > 0}
                                <div class="text-blue-600 text-xs">
                                    {rule.actions[0].actionType}: {rule.actions[0].target}
                                    {#if rule.actions.length > 1}
                                        <span class="text-gray-400"> +{rule.actions.length - 1} more</span>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        <div class="flex gap-1 flex-shrink-0">
                            <Button 
                                type="button"
                                variant="outline" 
                                size="sm"
                                onclick={(e) => openBuilder(e, rule)}
                                class="h-6 px-1 text-xs"
                            >
                                <Icon icon="lucide:edit" class="h-2.5 w-2.5" />
                            </Button>
                            <Button 
                                type="button"
                                variant="outline" 
                                size="sm"
                                onclick={(e) => removeRule(index, e)}
                                class="h-6 px-1 text-xs text-red-600 hover:text-red-700"
                            >
                                <Icon icon="lucide:trash-2" class="h-2.5 w-2.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Full Skip Logic Builder Modal -->
<SkipLogicBuilderFull 
    bind:isOpen={showBuilder}
    onSave={handleSave}
    onCancel={closeBuilder}
    editingRule={editingRule}
    {questionList}
/> 