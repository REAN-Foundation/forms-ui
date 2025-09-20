<script lang="ts">
    import { Button } from '../ui/button/index.js';
    import { Input } from '../ui/input/index.js';
    import { Label } from '../ui/label/index.js';
    import * as Select from '../ui/select/index.js';
    import Icon from '@iconify/svelte';
    import TreeNodeClean from '../calculation-logic/TreeNodeClean.svelte';
	import FallbackRuleInput from '../fallback-logic/FallbackRuleInput.svelte';
import { FallbackActionType, OperationType } from '$lib/components/submission/engine/types/fallback-rule';
    import {
        getAllFields,
        getCurrentOperators,
        getFieldDisplay,
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
        updateLogicalOperation,
        resetOperatorForCurrentField
    } from '../calculation-logic/service.js';
    import { toastMessage } from '../toast/toast.store.js';
    import { type FallbackRuleCreateModel } from '../submission/engine/types/fallback-rule.js';

    // Skip Rule Types
    interface SkipRuleCreateModel {
        Name: string;
        Description?: string;
        Priority?: number;
        IsActive?: boolean;
        OperationType?: string;
        OperationId?: string;
        BaseOperationId?: string;
        SkipWhenTrue?: boolean;
        LogicId?: string;
        FallbackRuleId?: string;
        ThenFallbackRuleId?: string;
    }

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
    
    // Fallback rule state
    let fallbackAction = $state<FallbackActionType>(FallbackActionType.SHOW_MESSAGE);
    let fallbackActionMessage = $state('');
    let fallbackActionParameters = $state({
        timeout: 0,
        maxRetries: 0,
        redirectUrl: '',
        customHandler: '',
        fieldValue: '',
        fieldState: '',
        messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
        showDuration: 0,
        validationRules: []
    });
    
    // Validation errors
    let errors = $state({} as Record<string, string>);
    
    // Server validation errors
    let serverErrors = $state({} as Record<string, string>);

    // Function to parse server validation errors
    function parseServerErrors(errorMessage: string): Record<string, string> {
        const errors: Record<string, string> = {};
        
        try {
            // Parse the error message array
            const errorArray = JSON.parse(errorMessage);
            
            errorArray.forEach((error: string) => {
                // Extract field name and error message
                const match = error.match(/"([^"]+)"\s+(.+)/);
                if (match) {
                    const fieldPath = match[1];
                    const errorMsg = match[2];
                    
                    // Map server field paths to UI field names
                    if (fieldPath.includes('ActionParameters.redirectUrl')) {
                        errors.redirectUrl = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.timeout')) {
                        errors.timeout = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.maxRetries')) {
                        errors.maxRetries = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.showDuration')) {
                        errors.showDuration = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.customHandler')) {
                        errors.customHandler = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.fieldValue')) {
                        errors.fieldValue = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.fieldState')) {
                        errors.fieldState = errorMsg;
                    } else if (fieldPath.includes('ActionParameters.messageType')) {
                        errors.messageType = errorMsg;
                    } else if (fieldPath.includes('ActionMessage')) {
                        errors.actionMessage = errorMsg;
                    } else if (fieldPath.includes('Action')) {
                        errors.action = errorMsg;
                    } else {
                        // Generic error for unknown fields
                        errors.general = errorMsg;
                    }
                }
            });
        } catch (e) {
            // If parsing fails, show the raw error message
            errors.general = errorMessage;
        }
        
        return errors;
    }


    // Fallback UI selection (mapped to DefaultSkip internally)
    let fallbackTarget = $state('Default Behavior');

    // State - logical mode
    let logicalConditionName = $state('');
    let logicalConditionField = $state('');
    let logicalConditionOperator = $state('Equal To');
    let logicalConditionValue = $state('');

    // State - composite mode
    let tree = $state<any>({ type: 'composite', operator: 'AND', children: [] });
    let collapsed = $state({} as Record<string, boolean>);
    
    // State for editing mode
    let isEditing = $derived(!!editingRule);
    let lastEditingRuleId = $state<string | null>(null);
    let initializedFromEditing = $state(false);
    let initializedCreate = $state(false);

    // Reset operator when field changes to ensure valid operator is selected
    function resetOperatorForCurrentFieldLocal() {
        logicalConditionOperator = resetOperatorForCurrentField(logicalConditionField, logicalConditionOperator, questionList);
    }

    // Reset form for create mode
    function resetForCreate() {
        ruleName = '';
        ruleDescription = '';
        useConditionalLogic = true; // Skip rules always have conditional logic
        conditionMode = 'composite';
        defaultSkip = false;
        fallbackAction = FallbackActionType.SHOW_MESSAGE;
        fallbackActionMessage = '';
        fallbackActionParameters = {
            timeout: 0,
            maxRetries: 0,
            redirectUrl: '',
            customHandler: '',
            fieldValue: '',
            fieldState: '',
            messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
            showDuration: 0,
            validationRules: []
        };
        logicalConditionName = '';
        logicalConditionField = '';
        logicalConditionOperator = 'Equal To';
        logicalConditionValue = '';
        tree = { type: 'composite', operator: 'AND', children: [] };
        collapsed = {};
        initializedCreate = true;
        initializedFromEditing = false;
    }

    // Initialize editing mode with existing rule data (following validation/calculation pattern)
    async function initializeEditing() {
        if (!editingRule) return;
        
        try {
            
            // Handle both original rule structure and mapped structure from SkipLogicIntegration
            const originalRule = editingRule.originalRule || editingRule;
            
            
            // Set basic rule info
            ruleName = originalRule.Name || originalRule.ruleName || '';
            ruleDescription = originalRule.Description || '';
            
            // Skip rules always have conditional logic
            useConditionalLogic = true;
            
            // Parse operation data if available
            if (originalRule.Operation) {
                const operation = originalRule.Operation;
                
                if (operation.Type === 'Logical') {
                    conditionMode = 'logical';
                    
                    // Parse logical operation
                    if (operation.Operands) {
                        try {
                            const operands = JSON.parse(operation.Operands);
                            
                            if (operands[0] && operands[0].Type === 'FieldReference') {
                                logicalConditionField = operands[0].FieldId || '';
                            }
                            if (operands[1] && operands[1].Type === 'Constant') {
                                logicalConditionValue = operands[1].Value || '';
                            }
                        } catch (e) {
                        }
                    }
                    // Map operator back to display name
                    const operatorMap: Record<string, string> = {
                        'Equal': 'Equal To',
                        'NotEqual': 'Not Equal To',
                        'GreaterThan': 'Greater Than',
                        'GreaterThanOrEqual': 'Greater Than or Equal',
                        'LessThan': 'Less Than',
                        'LessThanOrEqual': 'Less Than or Equal',
                        'Contains': 'Contains',
                        'DoesNotContain': 'Does Not Contain',
                        'Exists': 'Is Not Empty',
                        'IsTrue': 'Is True',
                        'IsFalse': 'Is False'
                    };
                    logicalConditionOperator = operatorMap[operation.Operator] || 'Equal To';
                    logicalConditionName = operation.Name || '';
                } else if (operation.Type === 'Composition') {
                    conditionMode = 'composite';
                    // Parse composite operation - this would need more complex parsing
                    // For now, initialize with empty tree
                    tree = { type: 'composite', operator: 'AND', children: [] };
                }
            } else {
                // No operation means no conditional logic
                useConditionalLogic = false;
                conditionMode = 'logical';
            }
            
            // Load fallback rule data
            await loadFallbackRuleData();
            
            
            initializedFromEditing = true;
        } catch (error) {
            toastMessage({ 
                Message: 'Error loading rule data for editing', 
                HttpCode: 400 
            });
        }
    }

    // Load fallback rule data for editing
    async function loadFallbackRuleData() {
        
        // Handle both original rule structure and mapped structure
        const originalRule = editingRule?.originalRule || editingRule;
        
        
        // First check if fallback rule data is already available in originalRule
        if (originalRule?.FallbackRule) {
            
            fallbackAction = originalRule.FallbackRule.Action || FallbackActionType.SHOW_MESSAGE;
            fallbackActionMessage = originalRule.FallbackRule.ActionMessage || 'An error occurred while processing this field.';
            
            // Handle ActionParameters - could be null, object, or string
            let actionParams = originalRule.FallbackRule.ActionParameters;
            if (typeof actionParams === 'string') {
                try {
                    actionParams = JSON.parse(actionParams);
                } catch (e) {
                    actionParams = {};
                }
            }
            
            fallbackActionParameters = {
                timeout: actionParams?.timeout || 0,
                maxRetries: actionParams?.maxRetries || 0,
                redirectUrl: actionParams?.redirectUrl || '',
                customHandler: actionParams?.customHandler || '',
                fieldValue: actionParams?.fieldValue || '',
                fieldState: actionParams?.fieldState || '',
                messageType: actionParams?.messageType || 'info' as 'info' | 'warning' | 'error' | 'success',
                showDuration: actionParams?.showDuration || 0,
                validationRules: actionParams?.validationRules || []
            };
            return;
        }

        // If not available, try to fetch it
        if (!originalRule?.FallbackRuleId) {
            // No fallback rule, use defaults
            fallbackAction = FallbackActionType.SHOW_MESSAGE;
            fallbackActionMessage = 'An error occurred while processing this field.';
            fallbackActionParameters = {
                timeout: 0,
                maxRetries: 0,
                redirectUrl: '',
                customHandler: '',
                fieldValue: '',
                fieldState: '',
                messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
                showDuration: 0,
                validationRules: []
            };
            return;
        }

        try {
            const response = await fetch(`/api/server/rules/fallback-rule/${originalRule.FallbackRuleId}`);
            if (response.ok) {
                const result = await response.json();
                const fallbackRule = result.Data;
                
                if (fallbackRule) {
                    fallbackAction = fallbackRule.Action || FallbackActionType.SHOW_MESSAGE;
                    fallbackActionMessage = fallbackRule.ActionMessage || 'An error occurred while processing this field.';
                    fallbackActionParameters = fallbackRule.ActionParameters || {
                        timeout: 0,
                        maxRetries: 0,
                        redirectUrl: '',
                        customHandler: '',
                        fieldValue: '',
                        fieldState: '',
                        messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
                        showDuration: 0,
                        validationRules: []
                    };
                }
            } else {
                fallbackAction = FallbackActionType.SHOW_MESSAGE;
                fallbackActionMessage = 'An error occurred while processing this field.';
                fallbackActionParameters = {
                    timeout: 0,
                    maxRetries: 0,
                    redirectUrl: '',
                    customHandler: '',
                    fieldValue: '',
                    fieldState: '',
                    messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
                    showDuration: 0,
                    validationRules: []
                };
            }
        } catch (error) {
            fallbackAction = FallbackActionType.SHOW_MESSAGE;
            fallbackActionMessage = 'An error occurred while processing this field.';
            fallbackActionParameters = {
                timeout: 0,
                maxRetries: 0,
                redirectUrl: '',
                customHandler: '',
                fieldValue: '',
                fieldState: '',
                messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
                showDuration: 0,
                validationRules: []
            };
        }
    }


    // Initialize form when modal opens or editing rule changes (following validation/calculation pattern)
    $effect(() => {
        if (!isOpen) return;
        
        if (isEditing && editingRule) {
            const currentRuleId = editingRule.id || editingRule.originalRule?.id;
            
            // Only initialize if this is a different rule or first time
            if (lastEditingRuleId !== currentRuleId) {
                lastEditingRuleId = currentRuleId;
                // Call async function
                initializeEditing();
            }
        } else if (!isEditing) {
            // Reset for create mode
            lastEditingRuleId = null;
            resetForCreate();
        }
    });

    // Reset operator when field changes to ensure valid operator for the field type
    $effect(() => {
        if (logicalConditionField) {
            resetOperatorForCurrentFieldLocal();
        }
    });

    // Helpers
    function validate(): string | null {
        if (!ruleName.trim()) return 'Rule name is required';
        // Skip rules always have conditional logic, so always validate conditions
        if (conditionMode === 'logical') {
            if (!logicalConditionField || !logicalConditionOperator) return 'Condition is incomplete';
            // Check if operator requires a value
            if (logicalConditionOperator !== 'Is Empty' && logicalConditionOperator !== 'Is Not Empty' && !logicalConditionValue.trim()) {
                return 'Value is required for this operator';
            }
        } else {
            if (!tree?.children || tree.children.length === 0) return 'Please add at least one condition';
            // Validate that all logical conditions in the tree are complete
            const hasValidConditions = validateTreeConditions(tree);
            if (!hasValidConditions) return 'Please complete all conditions in the tree';
        }
        return null;
    }

    // Helper function to validate tree conditions recursively
    function validateTreeConditions(node: any): boolean {
        if (node.type === 'logical') {
            const condition = node.condition;
            if (!condition.field || !condition.operator) return false;
            // Check if operator requires a value
            if (condition.operator !== 'Is Empty' && condition.operator !== 'Is Not Empty' && !condition.value?.trim()) {
                return false;
            }
            return true;
        } else if (node.type === 'composite') {
            if (!node.children || node.children.length === 0) return false;
            return node.children.every((child: any) => validateTreeConditions(child));
        }
        return false;
    }

    // API helpers

    async function createSkipRule(params: { logicId: string; operationType: string; operationId: string; fallbackRuleId?: string; }) {
        const payload: SkipRuleCreateModel = {
            Name: ruleName || 'Skip Rule',
            Description: ruleDescription || 'Skip rule',
            Priority: 1,
            IsActive: true,
            OperationType: params.operationType,
            OperationId: params.operationId,
            BaseOperationId: params.operationId,
            SkipWhenTrue: true,
            LogicId: params.logicId,
            FallbackRuleId: params.fallbackRuleId || undefined
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
        const result = await res.json();
        return result.Data?.id;
    }

    async function updateSkipRule(ruleId: string, params: { logicId: string; operationType: string; operationId: string; fallbackRuleId?: string; }) {
        const payload: SkipRuleCreateModel = {
            Name: ruleName || 'Skip Rule',
            Description: ruleDescription || 'Skip rule',
            Priority: 1,
            IsActive: true,
            OperationType: params.operationType,
            OperationId: params.operationId,
            BaseOperationId: params.operationId,
            SkipWhenTrue: true,
            LogicId: params.logicId,
            FallbackRuleId: params.fallbackRuleId || undefined
        };
        const res = await fetch(`/api/server/rules/skip-rule/${ruleId}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const d = await res.json();
            throw new Error(d?.Message || 'Failed to update skip rule');
        }
        const result = await res.json();
        return result.Data?.id;
    }

    async function handleSave(e?: Event) {
        e?.preventDefault();
        e?.stopPropagation();
        
        // Clear previous server errors
        serverErrors = {};
        
        const err = validate();
        if (err) {
            toastMessage({ Message: err, HttpCode: 400 });
            return;
        }


        try {
            // Map fallback UI to DefaultSkip flag
            defaultSkip = fallbackAction !== FallbackActionType.SHOW_MESSAGE;

            // Step 1: Create or update condition operation (skip rules always have conditions)
            let operationType = OperationType.Logical;
            let operationId = '';
            if (conditionMode === 'logical') {
                operationType = OperationType.Logical;
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
                operationType = OperationType.Composition;
                operationId = await createOperationsFromTree(tree, ruleName, ruleDescription, questionList);
            }

            // Step 2: Create or update fallback rule with operation ID (following validation/calculation pattern)
            let fallbackRuleId = null;
            if (operationId) {
                fallbackRuleId = await createOrUpdateFallbackRule(operationId, operationType);
                if (!fallbackRuleId) {
                }
            }


            // Step 3: Create or update skip logic (following validation/calculation pattern)
            let logicId = currentField?.SkipLogic?.id || '';
            if (!logicId) {
                // Create new skip logic
                const logicResponse = await fetch('/api/server/logic/skip-logic', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ 
                        FieldId: currentField.id, 
                        Enabled: true, 
                        DefaultSkip: defaultSkip 
                    })
                });
                
                if (!logicResponse.ok) {
                    const errorData = await logicResponse.json();
                    throw new Error(errorData.Message || 'Failed to create skip logic');
                }
                
                const logicResult = await logicResponse.json();
                logicId = logicResult.Data.id;
            } else {
                // Update existing skip logic
                const logicResponse = await fetch(`/api/server/logic/skip-logic/${logicId}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ 
                        FieldId: currentField.id, 
                        Enabled: true, 
                        DefaultSkip: defaultSkip 
                    })
                });
                
                if (!logicResponse.ok) {
                    const errorData = await logicResponse.json();
                    throw new Error(errorData.Message || 'Failed to update skip logic');
                }
            }

            // Step 4: Create or update skip rule (following validation/calculation pattern)
            let ruleId = null;
            if (isEditing && editingRule?.id) {
                // Update existing rule
                ruleId = await updateSkipRule(editingRule.id, { 
                    logicId, 
                    operationType: operationId ? operationType : OperationType.Logical, 
                    operationId: operationId || '', 
                    fallbackRuleId
                });
            } else {
                // Create new rule
                ruleId = await createSkipRule({ 
                    logicId, 
                    operationType: operationId ? operationType : OperationType.Logical, 
                    operationId: operationId || '', 
                    fallbackRuleId
                });
            }

            // Step 5: Update form field with skip logic ID (following validation/calculation pattern)
            if (logicId && ruleId) {
                const fieldUpdateData = {
                    id: currentField.id,
                    SkipLogicId: logicId
                };

                const fieldResponse = await fetch('/api/server/form-fields', {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(fieldUpdateData)
                });

                if (!fieldResponse.ok) {
                    const errorData = await fieldResponse.json();
                }
            }

            toastMessage({ Message: isEditing ? 'Skip rule updated successfully!' : 'Skip rule created successfully!', HttpCode: 200 });
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

    // Function to create or update fallback rule
    async function createOrUpdateFallbackRule(operationId?: string, operationType?: OperationType): Promise<string | null> {
        // Check if we're editing an existing fallback rule
        if (editingRule?.FallbackRuleId) {
            return await updateFallbackRule(editingRule.FallbackRuleId, operationId, operationType);
        } else {
            return await createFallbackRule(operationId, operationType);
        }
    }


    // Create a new fallback rule
    async function createFallbackRule(operationId?: string, operationType?: OperationType): Promise<string | null> {
        const fallbackRule: FallbackRuleCreateModel = {
            Name: `${ruleName} - Fallback Rule`,
            Description: `Fallback rule for ${ruleName}`,
            Priority: 1,
            IsActive: true,
            BaseOperationId: operationId || '',
            OperationType: operationType || OperationType.Logical,
            Action: fallbackAction,
            ActionMessage: fallbackActionMessage || 'An error occurred while processing this field.',
            ActionParameters: {} // Regular fallback rule doesn't use ActionParameters
        };

        try {
            const response = await fetch('/api/server/rules/fallback-rule', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(fallbackRule)
            });

            const result = await response.json();
            if (response.ok && result.Data?.id) {
                return result.Data.id;
            }
        } catch (error) {
        }

        return null;
    }

    // Update an existing fallback rule
    async function updateFallbackRule(fallbackRuleId: string, operationId?: string, operationType?: OperationType): Promise<string | null> {
        const fallbackRule: FallbackRuleCreateModel = {
            Name: `${ruleName} - Fallback Rule`,
            Description: `Fallback rule for ${ruleName}`,
            Priority: 1,
            IsActive: true,
            BaseOperationId: operationId || '',
            OperationType: operationType || OperationType.Logical,
            Action: fallbackAction,
            ActionMessage: fallbackActionMessage || 'An error occurred while processing this field.',
            ActionParameters: {} // Regular fallback rule doesn't use ActionParameters
        };

        try {
            const response = await fetch(`/api/server/rules/fallback-rule/${fallbackRuleId}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(fallbackRule)
            });

            const result = await response.json();
            if (response.ok) {
                return fallbackRuleId; // Return the same ID since we're updating
            }
        } catch (error) {
        }

        return null;
    }

    // Function to filter out empty ActionParameters
    function filterEmptyActionParameters(params: any): any {
        const filtered: any = {};
        
        Object.keys(params).forEach(key => {
            const value = params[key];
            // Only include non-empty values
            if (value !== null && value !== undefined && value !== '' && value !== 0) {
                // For strings, also check if they're not just whitespace
                if (typeof value === 'string' && value.trim() !== '') {
                    filtered[key] = value;
                } else if (typeof value !== 'string') {
                    filtered[key] = value;
                }
            }
        });
        
        return filtered;
    }

</script>

{#if isOpen}
	<div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
		<!-- Modal -->
		<div class="flex max-h-[90vh] w-[90%] max-w-4xl flex-col rounded-lg bg-white shadow-2xl">
			<!-- Modal Header -->
			<div
				class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-8 py-5"
			>
				<h2 class="text-xl font-semibold text-slate-700">
					{editingRule ? 'Edit Skip Rule' : 'Create Skip Rule'}
				</h2>
				<button
					type="button"
					onclick={handleCancel}
					class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					<Icon icon="mdi:close" class="h-5 w-5" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="flex-1 overflow-y-auto p-8">
				<!-- General Error Display -->
				{#if errors.general}
					<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
						<p class="text-sm text-red-600">{errors.general}</p>
					</div>
				{/if}

				<!-- Rule Validation Errors -->
				{#if errors.ruleName || errors.ruleDescription}
					<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
						{#if errors.ruleName}
							<p class="text-sm text-red-600">• {errors.ruleName}</p>
						{/if}
						{#if errors.ruleDescription}
							<p class="text-sm text-red-600">• {errors.ruleDescription}</p>
						{/if}
					</div>
				{/if}

				<!-- Rule Name -->
				<div class="mb-4">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Name</Label>
					<Input
						bind:value={ruleName}
						placeholder="Enter skip rule name"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
				</div>

				<!-- Rule Description -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Description</Label>
					<Input
						bind:value={ruleDescription}
						placeholder="Enter skip rule description"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
				</div>

				<!-- IF Section -->
				<div class="mb-5 rounded-md border-2 border-gray-200 bg-white p-4">
					<h3 class="mb-4 font-medium text-slate-700">IF Section</h3>
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

                    <!-- Grouping Controls (only show for composite mode) -->
                    {#if conditionMode === 'composite'}
                        <div class="mb-4 flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onclick={() => { tree = addGroup(tree, [], 'AND'); }}>
                                <Icon icon="lucide:layers" class="h-3 w-3 mr-1" /> Add Group
                            </Button>
                            <Button type="button" variant="outline" size="sm" onclick={() => { tree = addLogical(tree, []); }}>
                                <Icon icon="lucide:plus" class="h-3 w-3 mr-1" /> Add Condition
                            </Button>
                        </div>
                    {/if}

                    {#if conditionMode === 'logical'}
                        <div class="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium text-gray-700">Name of Condition</Label>
                                    <Input
                                        type="text"
                                        bind:value={logicalConditionName}
                                        placeholder="Enter condition name"
                                        class="w-full"
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium text-gray-700">Field</Label>
                                    <Select.Root
                                        type="single"
                                        bind:value={logicalConditionField}
                                    >
                                        <Select.Trigger class="w-full">
                                            {logicalConditionField
                                                ? getFieldDisplay(logicalConditionField, questionList)
                                                : 'Select field'}
                                        </Select.Trigger>
                                        <Select.Content>
                                            {#each getAllFields(questionList) as field}
                                                <Select.Item value={field.id} label={field.Title || field.DisplayCode} />
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium text-gray-700">Operator</Label>
                                    <Select.Root
                                        type="single"
                                        bind:value={logicalConditionOperator}
                                    >
                                        <Select.Trigger class="w-full">
                                            {logicalConditionOperator || 'Select operator'}
                                        </Select.Trigger>
                                        <Select.Content>
                                            {#each getCurrentOperators(logicalConditionField, questionList) as operator}
                                                <Select.Item value={operator} label={operator} />
                                            {/each}
                                        </Select.Content>
                                    </Select.Root>
                                </div>
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium text-gray-700">Value</Label>
                                    <Input
                                        type="text"
                                        bind:value={logicalConditionValue}
                                        placeholder="Enter value"
                                        class="w-full"
                                        disabled={logicalConditionOperator === 'Is Empty' || logicalConditionOperator === 'Is Not Empty'}
                                    />
                                </div>
                            </div>
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


				<!-- Fallback Rules Section -->
				<div class="mb-6 rounded-lg border-2 border-gray-200 bg-white p-5">
					<div class="mb-4 flex items-center gap-2">
						<Icon icon="lucide:shield-alert" class="h-5 w-5" />
						<h3 class="text-base font-medium text-gray-900">Fallback Rules</h3>
					</div>
					
					<!-- Server Error Display -->
					{#if serverErrors.general}
						<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<p class="text-sm text-red-600">{serverErrors.general}</p>
						</div>
					{/if}
					
					<div class="space-y-4">
						<p class="text-sm text-gray-600">
							Define what should happen when this skip rule fails or encounters an error.
						</p>
						<FallbackRuleInput
							bind:action={fallbackAction}
							bind:actionMessage={fallbackActionMessage}
							bind:actionParameters={fallbackActionParameters}
						/>
					</div>
				</div>


			</div>

			<!-- Modal Footer -->
			<div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-8 py-5">
				<Button
					variant="outline"
					onclick={handleCancel}
					class="rounded-md border border-gray-300 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50"
				>
					Cancel
				</Button>
				<Button
					variant="default"
					onclick={handleSave}
					class="rounded-md bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-800"
				>
					Save Skip Rule
				</Button>
			</div>
		</div>
	</div>
{/if} 