<script lang="ts">
	import { toastMessage } from '../toast/toast.store.js';
    import { Button } from '../ui/button/index.js';
    import ValidationLogicBuilderFull from './ValidationLogicBuilderFull.svelte';
    import Icon from '@iconify/svelte';

    // Props
    let { fieldId, fieldName, onValidationSaved, questionCard, questionList } = $props();

    // State
    let showBuilder = $state(false);
    let validationRules = $state([]);
    let editingRule = $state(null);

    // Initialize validation rules from backend data
    $effect(() => {
        if (questionCard?.ValidateLogic?.Rules) {
            validationRules = questionCard.ValidateLogic.Rules.map(rule => {
                const isLogical = rule.OperationType?.toLowerCase() === 'logical';
                
                return {
                    id: rule.id,
                    ruleName: rule.Name,
                    activeTab: rule.OperationType?.toLowerCase() || 'logical',
                    errorMessage: rule.ErrorMessage,
                    // For logical rules, create a single condition from the operation
                    conditions: isLogical ? [{
                        field: rule.Operation?.FieldReference || '',
                        operator: rule.Operation?.Operator || '',
                        value: rule.Operation?.Value || '',
                        connector: null
                    }] : (rule.Operation?.Operands || []),
                    operator: rule.Operation?.Operator || '',
                    fieldReference: rule.Operation?.FieldReference || '',
                    value: rule.Operation?.Value || '',
                    regexPattern: rule.Operation?.RegexPattern || '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    selectedField: rule.Operation?.FieldReference || 'Email',
                    compositeConditions: rule.Operation?.CompositeConditions || [],
                    messageSeverity: rule.Operation?.MessageSeverity || 'error',
                    successMessage: rule.Operation?.SuccessMessage || '',
                    fallbackAction: rule.Operation?.FallbackAction || 'Allow submission with warning',
                    createdAt: rule.CreatedAt
                };
            });
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

    async function handleSave(validationData) {
        if (editingRule) {
            // Update existing rule
            const index = validationRules.findIndex(rule => rule.id === editingRule.id);
            if (index !== -1) {
                validationRules[index] = {
                    ...validationRules[index],
                    ...validationData,
                    id: editingRule.id,
                    createdAt: editingRule.createdAt
                };
            }
        } else {
            // Add the new rule to our list
            const response = await fetch(`/api/server/logic/validation-logic`, {
					method: 'POST',
					body: JSON.stringify({
						FieldId: fieldId,
						Enabled: true
					}),
					headers: { 'content-type': 'application/json' }
				});
				const validationLogicData = await response.json();
				toastMessage(validationLogicData);
				console.log('ValidationLogicData: ', validationLogicData);
        }

        // Call the parent callback if provided
        if (onValidationSaved) {
            onValidationSaved(validationData);
        }

        // Close the builder
        closeBuilder(null);
    }

    function removeRule(index, event) {
        event?.preventDefault();
        event?.stopPropagation();
        validationRules.splice(index, 1);
    }
</script>

<!-- Validation Logic Section -->
<div class="my-4 rounded-lg border border-gray-200 p-3 bg-gray-50">
    <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <h4 class="flex items-center gap-1 text-sm font-semibold text-gray-800">
                <Icon icon="lucide:search" class="h-3 w-3" />
                Validation Logic
            </h4>
            {#if validationRules.length > 0}
                <span class="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border">
                    {validationRules.length} rule{validationRules.length !== 1 ? 's' : ''}
                </span>
            {/if}
        </div>
        <Button type="button" variant="outline" size="sm" onclick={(e) => openBuilder(e)} class="h-7 px-2 text-xs">
            <Icon icon="lucide:plus" class="h-3 w-3 mr-1" />
            Add Rule
        </Button>
    </div>
    
    {#if validationRules.length > 0}
        <div class="space-y-2 max-h-48 overflow-y-auto">
            {#each validationRules as rule, index}
                <div class="rounded border border-gray-200 bg-white p-2 text-xs">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-gray-800 truncate">{rule.ruleName}</div>
                            <div class="text-gray-600">
                                Type: <span class="font-medium capitalize">{rule.activeTab}</span>
                            </div>
                            {#if rule.activeTab === 'regex'}
                                <div class="text-gray-500 font-mono bg-gray-100 p-1 rounded text-xs truncate">
                                    {rule.regexPattern}
                                </div>
                            {:else if rule.activeTab === 'logical'}
                                <div class="text-gray-500">
                                    {rule.operator} {rule.fieldReference} {rule.value}
                                </div>
                            {:else if rule.activeTab === 'composite'}
                                <div class="text-gray-500">
                                    {rule.conditions.length} composite condition(s)
                                </div>
                            {/if}
                            {#if rule.errorMessage}
                                <div class="text-red-600 truncate">
                                    {rule.errorMessage}
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

<!-- Full Validation Logic Builder Modal -->
<ValidationLogicBuilderFull 
    bind:isOpen={showBuilder}
    onSave={handleSave}
    onCancel={closeBuilder}
    editingRule={editingRule}
    currentField={questionCard}
    {questionList}
/>
