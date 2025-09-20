<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';
	import TreeNodeClean from './TreeNodeClean.svelte';
	import ExpressionBuilder from './ExpressionBuilder.svelte';
	import FallbackRuleInput from '../fallback-logic/FallbackRuleInput.svelte';
	import { FallbackActionType, OperationType } from '$lib/components/submission/engine/types/fallback-rule';
	import {
		createFunctionExpressionOperation,
		updateFunctionExpressionOperation,
		createCalculationRule,
		updateCalculationRule,
		ensureCalculationLogic,
		linkLogicToField,
		getAllFields,
		getFieldDisplay,
		getCurrentOperators,
		updateLogicalOperationById,
		updateLogicalOperation,
		createOperationsFromTree,
		addLogicalToTree,
		addGroupToTree,
		removeNodeFromTree,
		updateGroupOperatorInTree,
		updateLeafFieldInTree,
		updateLeafOperatorInTree,
		updateLeafValueInTree,
		updateLeafNameInTree,
		toggleCollapseForPath,
		resetOperatorForCurrentField as resetOperatorForCurrentFieldService,
		initializeEditingData,
		resetForCreate as resetForCreateService,
		resetFormState as resetFormStateService
	} from './service.js';

	// Props
	let {
		isOpen = $bindable(false),
		onSave,
		onCancel,
		editingRule = null,
		questionList,
		currentField
	} = $props();

	// State variables - Rule configuration
	let errors = $state({} as Record<string, string>);
	let useConditionalLogic = $state(false);
	let conditionMode = $state<'logical' | 'composite'>('composite');
	let outcomeMode = $state<'static' | 'expression'>('expression');
	let staticValue = $state('');
	let staticValueDataType = $state('Float');
	let logicalConditionName = $state('');
	let logicalConditionField = $state('');
	let logicalConditionOperator = $state('');
	let logicalConditionValue = $state('');
	let ruleName = $state('');
	let ruleDescription = $state('');

	// State variables - Tree and UI management
	let tree = $state<any>({
		type: 'composite',
		operator: 'AND',
		children: []
	});
	let collapsed = $state({} as Record<string, boolean>);
	let expressions = $state({} as Record<string, string>);
	let updateOperations = $state(false); // Checkbox for updating operations in edit mode
	let decimalPlaces = $state('2');
	let roundingMethod = $state('Round to nearest');
	let autoUpdate = $state(false);
	let showFormula = $state(false);
	let allowManualOverride = $state(false);
	let numberFormat = $state('number');
	let lastInitializedRuleId = $state(null);
	
	// Fallback rule state
	let fallbackAction = $state(FallbackActionType.SHOW_MESSAGE);
	let fallbackActionMessage = $state('');

	// Constants
	const roundingMethods = ['Round to nearest', 'Round up', 'Round down', 'Truncate'];
	const numberFormats = ['number', 'currency', 'percentage', 'scientific'];
	const dataTypes = [
		'Text', 
		'Float', 
		'Integer', 
		'Boolean', 
		'DateTime', 
		'Location'
	];
	// Reset operator when field changes to ensure valid operator is selected
	function resetOperatorForCurrentField() {
		logicalConditionOperator = resetOperatorForCurrentFieldService(logicalConditionField, logicalConditionOperator, questionList);
	}
	// Helper Functions
	// Form Management Functions

	// Initialize editing mode when editingRule prop changes
	$effect(() => {
		if (editingRule) {
			const currentRuleId = editingRule.id || editingRule.originalRule?.id;
			
			// Only initialize if this is a different rule or first time
			if (lastInitializedRuleId !== currentRuleId) {
				lastInitializedRuleId = currentRuleId;
				initializeEditing();
			}
		} else if (isOpen) {
			// Reset for create mode
			lastInitializedRuleId = null;
			resetForCreate();
		}
	});

	// Reset operator when field changes to ensure valid operator for the field type
	$effect(() => {
		if (logicalConditionField) {
			resetOperatorForCurrentField();
		}
	});

	// Reset form for create mode
	function resetForCreate() {
		const resetState = resetForCreateService();
		
		// Update reactive variables
		ruleName = resetState.ruleName;
		ruleDescription = resetState.ruleDescription;
		useConditionalLogic = resetState.useConditionalLogic;
		conditionMode = resetState.conditionMode;
		outcomeMode = resetState.outcomeMode;
		staticValue = resetState.staticValue;
		staticValueDataType = resetState.staticValueDataType;
		logicalConditionName = resetState.logicalConditionName;
		logicalConditionField = resetState.logicalConditionField;
		logicalConditionOperator = resetState.logicalConditionOperator;
		logicalConditionValue = resetState.logicalConditionValue;
		tree = resetState.tree;
		expressions = resetState.expressions;
		decimalPlaces = resetState.decimalPlaces;
		roundingMethod = resetState.roundingMethod;
		autoUpdate = resetState.autoUpdate;
		showFormula = resetState.showFormula;
		allowManualOverride = resetState.allowManualOverride;
		numberFormat = resetState.numberFormat;
		updateOperations = resetState.updateOperations;
	}
	
	// Reset form state for editing
	function resetFormState() {
		const resetState = resetFormStateService();
		
		// Update reactive variables
		ruleName = resetState.ruleName;
		ruleDescription = resetState.ruleDescription;
		useConditionalLogic = resetState.useConditionalLogic;
		conditionMode = resetState.conditionMode;
		logicalConditionField = resetState.logicalConditionField;
		logicalConditionOperator = resetState.logicalConditionOperator;
		logicalConditionValue = resetState.logicalConditionValue;
		logicalConditionName = resetState.logicalConditionName;
		outcomeMode = resetState.outcomeMode;
		staticValue = resetState.staticValue;
		staticValueDataType = resetState.staticValueDataType;
		decimalPlaces = resetState.decimalPlaces;
		roundingMethod = resetState.roundingMethod;
		autoUpdate = resetState.autoUpdate;
		showFormula = resetState.showFormula;
		allowManualOverride = resetState.allowManualOverride;
		numberFormat = resetState.numberFormat;
		expressions = resetState.expressions;
		tree = resetState.tree;
		updateOperations = resetState.updateOperations;
	}
	// Initialize editing mode with existing rule data
	async function initializeEditing() {
		if (!editingRule) return;
		
		// Reset form state first to ensure clean initialization
		resetFormState();

		try {
			const editingData = initializeEditingData(editingRule, questionList);
			if (editingData) {
				// Apply all the parsed data to form state
				ruleName = editingData.ruleName;
				ruleDescription = editingData.ruleDescription;
				decimalPlaces = editingData.decimalPlaces;
				roundingMethod = editingData.roundingMethod;
				autoUpdate = editingData.autoUpdate;
				showFormula = editingData.showFormula;
				allowManualOverride = editingData.allowManualOverride;
				numberFormat = editingData.numberFormat;
				useConditionalLogic = editingData.useConditionalLogic;
				conditionMode = editingData.conditionMode;
				logicalConditionField = editingData.logicalConditionField;
				logicalConditionOperator = editingData.logicalConditionOperator;
				logicalConditionValue = editingData.logicalConditionValue;
				logicalConditionName = editingData.logicalConditionName;
				tree = editingData.tree;
				outcomeMode = editingData.outcomeMode;
				staticValue = editingData.staticValue;
				staticValueDataType = editingData.staticValueDataType;
				expressions = editingData.expressions;
				
				// Load fallback rule data if it exists
				await loadFallbackRuleData();
			}
		} catch (error) {
			toastMessage({
				Message: 'Error loading rule data for editing',
				type: 'error'
			});
		}
	}

	// Load fallback rule data for editing
	async function loadFallbackRuleData() {
		// First check if fallback rule data is already available in editingRule
		if (editingRule.originalRule?.FallbackRule) {
			fallbackAction = editingRule.originalRule.FallbackRule.Action || FallbackActionType.SHOW_MESSAGE;
			fallbackActionMessage = editingRule.originalRule.FallbackRule.ActionMessage || 'Validation failed, please check your input';
			return;
		}

		// If not available, try to fetch it
		if (!editingRule?.originalRule?.FallbackRuleId) {
			// No fallback rule, use defaults
			fallbackAction = FallbackActionType.SHOW_MESSAGE;
			fallbackActionMessage = 'Validation failed, please check your input';
			return;
		}

		try {
			const response = await fetch(`/api/server/rules/fallback-rule/${editingRule.originalRule.FallbackRuleId}`);
			if (response.ok) {
				const result = await response.json();
				const fallbackRule = result.Data;
				
				if (fallbackRule) {
					fallbackAction = fallbackRule.Action || FallbackActionType.SHOW_MESSAGE;
					fallbackActionMessage = fallbackRule.ActionMessage || 'Validation failed, please check your input';
				}
			} else {
				fallbackAction = FallbackActionType.SHOW_MESSAGE;
				fallbackActionMessage = 'Validation failed, please check your input';
			}
		} catch (error) {
			fallbackAction = FallbackActionType.SHOW_MESSAGE;
			fallbackActionMessage = 'Validation failed, please check your input';
		}
	}

	// Tree Manipulation Functions
	function addLogical(path: number[]) { tree = addLogicalToTree(tree, path); }
	function addGroup(path: number[], operator: 'AND' | 'OR' = 'AND') { tree = addGroupToTree(tree, path, operator); }
	function removeNode(path: number[]) { tree = removeNodeFromTree(tree, path); }
	function updateGroupOperator(path: number[], operator: 'AND' | 'OR') { tree = updateGroupOperatorInTree(tree, path, operator); }
	function updateLeafField(path: number[], field: string) { tree = updateLeafFieldInTree(tree, path, field); }
	function updateLeafOperator(path: number[], operator: string) { tree = updateLeafOperatorInTree(tree, path, operator); }
	function updateLeafValue(path: number[], value: string) { tree = updateLeafValueInTree(tree, path, value); }
	function updateLeafName(path: number[], name: string) { tree = updateLeafNameInTree(tree, path, name); }
	function updateExpression(key: string, value: string) { expressions[key] = value; }
	function toggleCollapse(path: number[]) { collapsed = toggleCollapseForPath(collapsed, path); }
	// Operation Update Helper Functions

	// Event Handlers

	async function handleUpdateLogicalCondition(event) {
		event?.preventDefault();
		event?.stopPropagation();
		
		// Validate required fields
		if (!logicalConditionField || !logicalConditionField.trim()) {
			toastMessage({
				Message: 'Condition field is required',
				HttpCode: 400
			});
			return;
		}

		if (!logicalConditionOperator || !logicalConditionOperator.trim()) {
			toastMessage({
				Message: 'Condition operator is required',
				HttpCode: 400
			});
			return;
		}

		// Check if we have an operation ID to update
		if (!editingRule?.conditionsOperationId) {
			toastMessage({
				Message: 'No logical operation found to update',
				HttpCode: 400
			});
			return;
		}
		
		try {
			toastMessage({
				Message: 'Updating logical condition...',
				type: 'info'
			});

			// Update the logical operation with current UI values
			const condition = {
				field: logicalConditionField,
				operator: logicalConditionOperator,
				value: logicalConditionValue,
				name: logicalConditionName
			};
			await updateLogicalOperationById(editingRule.conditionsOperationId, condition, ruleName, ruleDescription, questionList);

			// Success!
			toastMessage({
				Message: 'Logical condition updated successfully!',
				type: 'success'
			});

			// Call the onSave callback if provided
			if (onSave) {
				const resultData = {
					conditionsOperationId: editingRule.conditionsOperationId,
					logicalConditionField,
					logicalConditionOperator,
					logicalConditionValue,
					logicalConditionName,
					isUpdate: true
				};
				onSave(resultData);
			}
		} catch (e) {
			toastMessage({
				Message: (e as Error)?.message || 'Failed to update logical condition',
				HttpCode: 500
			});
		}
	}

	function handleCancel(event) {
		event?.preventDefault();
		event?.stopPropagation();
		onCancel?.();
	}

	async function handleUpdateRule(event) {
		event?.preventDefault();
		event?.stopPropagation();
		
		// Validate required fields
		if (!ruleName.trim()) {
			toastMessage({
				Message: 'Rule name is required',
				HttpCode: 400
			});
			return;
		}

		if (!editingRule?.id) {
			toastMessage({
				Message: 'No rule ID found for updating',
				HttpCode: 400
			});
			return;
		}
		
		try {
			toastMessage({
				Message: 'Updating calculation rule...',
				type: 'info'
			});

			// Step 1: Update operations only if checkbox is checked
			let conditionsOperationId = editingRule.conditionsOperationId || null;
			let outcomeOperationId = editingRule.outcomeOperationId || null;

			if (updateOperations) {
				// Update conditional operations only if conditional logic is enabled and fields are provided
				if (useConditionalLogic) {
					if (conditionMode === 'logical' && logicalConditionField && logicalConditionField.trim() && logicalConditionOperator && logicalConditionOperator.trim()) {
						const condition = {
							field: logicalConditionField,
							operator: logicalConditionOperator,
							value: logicalConditionValue,
							name: logicalConditionName
						};
						conditionsOperationId = await updateLogicalOperation(editingRule.conditionsOperationId, condition, ruleName, ruleDescription, questionList);
					} else if (conditionMode === 'composite' && tree.children && tree.children.length > 0) {
						conditionsOperationId = await createOperationsFromTree(tree, ruleName, ruleDescription, questionList);
					}
				}

				// Update outcome operation only if expression mode and expression is provided
				if (outcomeMode === 'expression' && expressions['global'] && expressions['global'].trim()) {
					if (editingRule.outcomeOperationId) {
						await updateFunctionExpressionOperation(editingRule.outcomeOperationId, expressions['global'] || '', ruleName, questionList);
						outcomeOperationId = editingRule.outcomeOperationId;
					} else {
						outcomeOperationId = await createFunctionExpressionOperation(expressions['global'] || '', ruleName, questionList);
					}
				}
			} else {
				// When checkbox is unchecked, we still need to handle outcome changes
				// If switching from expression to static, clear the operation ID
				// If switching from static to expression, we need to create/update the operation
				if (outcomeMode === 'static') {
					// Clear operation ID when switching to static
					outcomeOperationId = null;
				} else if (outcomeMode === 'expression' && expressions['global'] && expressions['global'].trim()) {
					// If we have an expression but checkbox is unchecked, we still need to update the outcome
					// This handles the case where user changes expression without checking the operations checkbox
					if (editingRule.outcomeOperationId) {
						// Update existing operation
						await updateFunctionExpressionOperation(editingRule.outcomeOperationId, expressions['global'] || '', ruleName, questionList);
						outcomeOperationId = editingRule.outcomeOperationId;
					} else {
						// Create new operation
						outcomeOperationId = await createFunctionExpressionOperation(expressions['global'] || '', ruleName, questionList);
					}
				}
			}

			// Step 2: Update the calculation rule with current UI values
		const settings = {
				DecimalPlaces: parseInt(decimalPlaces) || 2,
			RoundingMethod: roundingMethod,
			AutoUpdate: autoUpdate,
			ShowFormula: showFormula,
			AllowManualOverride: allowManualOverride,
			NumberFormat: numberFormat
		};

			// Prepare RuleOutcome based on current UI values
			let ruleOutcome = null;
			if (outcomeMode === 'static') {
				ruleOutcome = {
					Type: 'StaticValue',
					StaticValue: staticValue,
					DataType: staticValueDataType
				};
			} else if (outcomeMode === 'expression') {
				ruleOutcome = {
					Type: 'FunctionExpression',
					FunctionExpression: expressions['global'] || '',
					FunctionExpressionId: outcomeOperationId
				};
			}

			// Determine operation type based on current UI state
			const operationType = useConditionalLogic ? 
				(conditionMode === 'logical' ? OperationType.Logical : OperationType.Composition) : 
				(editingRule.originalRule?.OperationType || OperationType.FunctionExpression);

			// Create or update fallback rule with operation ID
			let fallbackRuleId = null;
			fallbackRuleId = await createOrUpdateFallbackRule(conditionsOperationId, operationType);
			if (!fallbackRuleId) {
				console.warn('Failed to create/update fallback rule, proceeding without it');
			}

			// Ensure we have a valid operation ID for update
			const finalOperationId = conditionsOperationId || editingRule.conditionsOperationId;
			if (!finalOperationId) {
				throw new Error('No valid operation ID found for update. Please check your condition configuration.');
			}

			console.log('Updating calculation rule with BaseOperationId:', finalOperationId);

			// Update the calculation rule with all current values
			await updateCalculationRule({
				ruleId: editingRule.id,
				conditionOperationId: finalOperationId,
				operationType,
				ruleName,
				ruleDescription,
				fallbackRuleId,
				settings,
				ruleOutcome
			});

			// Success!
			toastMessage({
				Message: 'Calculation rule updated successfully!',
				type: 'success'
			});

			// Call the onSave callback
			if (onSave) {
				const resultData = {
					ruleId: editingRule.id,
					conditionsOperationId,
					outcomeOperationId,
			ruleName,
			ruleDescription,
			settings,
					ruleOutcome,
					isUpdate: true
				};
				onSave(resultData);
			}

			// Close the modal
			onCancel?.();
		} catch (e) {
			toastMessage({
				Message: (e as Error)?.message || 'Failed to update calculation rule',
				HttpCode: 500
			});
		}
	}

	// Function to create or update fallback rule
	async function createOrUpdateFallbackRule(operationId?: string, operationType?: string): Promise<string | null> {
		// Check if we're editing an existing fallback rule
		if (editingRule?.FallbackRuleId) {
			return await updateFallbackRule(editingRule.FallbackRuleId, operationId, operationType);
		} else {
			return await createFallbackRule(operationId, operationType);
		}
	}

	// Create a new fallback rule
	async function createFallbackRule(operationId?: string, operationType?: string): Promise<string | null> {
		const fallbackRule = {
			Name: `${ruleName} - Fallback Rule`,
			Description: `Fallback rule for ${ruleName}`,
			Priority: 1,
			IsActive: true,
			OperationType: operationType || OperationType.FunctionExpression,
			BaseOperationId: operationId || '',
			Action: fallbackAction,
			ActionMessage: fallbackActionMessage,
			ActionParameters: {}
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
			console.error('Error creating fallback rule:', error);
		}

		return null;
	}

	// Update an existing fallback rule
	async function updateFallbackRule(fallbackRuleId: string, operationId?: string, operationType?: string): Promise<string | null> {
		const fallbackRule = {
			Name: `${ruleName} - Fallback Rule`,
			Description: `Fallback rule for ${ruleName}`,
			Priority: 1,
			IsActive: true,
			OperationType: operationType || OperationType.FunctionExpression,
			BaseOperationId: operationId || '',
			Action: fallbackAction,
			ActionMessage: fallbackActionMessage,
			ActionParameters: {}
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
			console.error('Error updating fallback rule:', error);
		}

		return null;
	}

	async function handleSave(event) {
		event?.preventDefault();
		event?.stopPropagation();

		// Check if this is an edit operation
		if (editingRule) {
			return await handleUpdateRule(event);
		}

		let finalFallbackRuleId = null;

		// Validate required fields
		if (!ruleName.trim()) {
			toastMessage({
				Message: 'Rule name is required',
				HttpCode: 400
			});
			return;
		}

		if (!currentField?.id) {
			toastMessage({
				Message: 'No field selected for calculation logic',
				HttpCode: 400
			});
			return;
		}

		try {
			toastMessage({
				Message: 'Creating calculation logic...',
				type: 'info'
			});

			let conditionsOperationId: string | null = null;

			// Step 1: Create operations based on the logic type
			if (useConditionalLogic) {
				if (conditionMode === 'logical') {
					// Only create logical operation if condition fields are provided and valid
					if (logicalConditionField && logicalConditionField.trim() && logicalConditionOperator && logicalConditionOperator.trim()) {
						// Create logical operation using service function
						const condition = {
							field: logicalConditionField,
							operator: logicalConditionOperator,
							value: logicalConditionValue,
							name: logicalConditionName
						};
						conditionsOperationId = await updateLogicalOperation(null, condition, ruleName, ruleDescription, questionList);
					}
					// If no condition fields provided, conditionsOperationId remains null
				} else if (conditionMode === 'composite') {
					// Create composite operation for tree structure only if tree has valid conditions
					if (tree.children && tree.children.length > 0) {
					conditionsOperationId = await createOperationsFromTree(tree, ruleName, ruleDescription, questionList);
				}
					// If tree is empty, conditionsOperationId remains null
				}
				
				// Validate that we have a condition operation if conditional logic is enabled
				if (!conditionsOperationId) {
					throw new Error('Failed to create condition operation. Please check your condition settings.');
				}
			}

			// Step 2: Create function expression operation
			let outcomeOperationId: string | null = null;
			if (outcomeMode === 'expression') {
				// Create function expression operation
				outcomeOperationId = await createFunctionExpressionOperation(
					expressions['global'] || '',
					ruleName,
					questionList
				);
			}
			
			// If no conditional logic is used, we need to handle the case where there's no operation
			if (!useConditionalLogic) {
				if (outcomeOperationId) {
					// Use the outcome operation as the base operation
					conditionsOperationId = outcomeOperationId;
				} else {
					// For static mode without conditional logic, we don't have an operation
					// This is a valid case - the calculation rule will work without a BaseOperationId
					conditionsOperationId = null;
				}
			}

			// Determine the operation type based on user's choice
			const operationType = useConditionalLogic ? 
				(conditionMode === 'logical' ? OperationType.Logical : OperationType.Composition) : 
				OperationType.FunctionExpression;

			// Step 2.5: Create or update fallback rule with operation ID
			finalFallbackRuleId = await createOrUpdateFallbackRule(conditionsOperationId, operationType);
			if (!finalFallbackRuleId) {
				console.warn('Failed to create/update fallback rule, proceeding without it');
			}

			// Step 3: Create the calculation rule
			// First create a calculation logic if it doesn't exist
			let logicId = currentField?.CalculateLogic?.id || '';
			if (!logicId) {
				logicId = await ensureCalculationLogic(currentField);
			}
			
			// Validate that we have a valid operation ID
			if (!conditionsOperationId) {
				throw new Error('No valid operation ID found. Please check your configuration.');
			}
			
			// Validate that we have content for the outcome
			if (outcomeMode === 'static' && !staticValue.trim()) {
				throw new Error('Static value is required when outcome mode is static');
			}
			
			if (outcomeMode === 'expression' && (!expressions['global'] || !expressions['global'].trim())) {
				throw new Error('Function expression is required when outcome mode is expression');
			}
			
			const ruleOutcome = outcomeMode === 'static' ? {
				Type: 'StaticValue',
				StaticValue: staticValue,
				DataType: staticValueDataType
			} : {
				Type: 'FunctionExpression',
				FunctionExpression: expressions['global'] || '',
				DataType: 'Float'
			};
			
			// Ensure we have a valid operation ID (unless it's static mode without conditional logic)
			if (!conditionsOperationId && (useConditionalLogic || outcomeMode === 'expression')) {
				throw new Error('No valid operation ID found. Please check your condition configuration.');
			}

			console.log('Creating calculation rule with BaseOperationId:', conditionsOperationId);

			const ruleData = {
				logicId,
				conditionOperationId: conditionsOperationId, // Use the logical/composite/function expression operation ID as the main operation
				operationType, // Pass the correct operation type
				ruleName,
				ruleDescription,
				settings: {
					DecimalPlaces: parseInt(decimalPlaces) || 2,
					RoundingMethod: roundingMethod,
					AutoUpdate: autoUpdate,
					ShowFormula: showFormula,
					AllowManualOverride: allowManualOverride,
					NumberFormat: numberFormat
				},
				ruleOutcome,
				fallbackRuleId: finalFallbackRuleId || undefined
			};

			const ruleResult = await createCalculationRule(ruleData);

			// Step 4: Update the form field with the logic ID
			await linkLogicToField(currentField, logicId);

			// Success!
			toastMessage({
				Message: 'Calculation logic created and saved successfully!',
				type: 'success'
			});

			// Call the onSave callback with the result
			if (onSave) {
				onSave(ruleResult);
			}

			// Close the modal
			onCancel?.();

		} catch (e) {
			toastMessage({
				Message: (e as Error)?.message || 'Failed to save calculation rule',
				HttpCode: 500
			});
		}
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
					{editingRule ? 'Edit Calculation Rule' : 'Create Calculation Rule'}
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
						placeholder="Enter calculation rule name"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
				</div>

				<!-- Rule Description -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Description</Label>
					<Input
						bind:value={ruleDescription}
						placeholder="Enter calculation rule description"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
				</div>

				<!-- 2.5. Update Operations Checkbox (Edit Mode Only) -->
				{#if editingRule}
					<div class="mb-4">
						<div class="flex items-center justify-between">
							<label class="inline-flex items-center gap-2 text-base font-medium text-gray-900">
								<input
									type="checkbox"
									bind:checked={updateOperations}
									class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								Update Operations
							</label>
						</div>
						<div class="mt-1 text-xs text-gray-500">
							Check this to update the conditional logic and outcome operations. Leave unchecked to only update rule details.
						</div>
					</div>
				{/if}

				<!-- 3. Conditional Logic Checkbox -->
				<div class="mb-4">
					<div class="flex items-center justify-between">
						<label class="inline-flex items-center gap-2 text-base font-medium text-gray-900">
							<input
								type="checkbox"
								bind:checked={useConditionalLogic}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							Conditional
					</label>
					</div>
				</div>

				<!-- 4. Conditions Section -->
				{#if useConditionalLogic && (editingRule ? updateOperations : true)}
					<div class="mb-6 rounded-lg border border-gray-300 p-6">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-base font-medium text-blue-600">condition</h3>
						</div>

						<!-- Mode Selection: Logical vs Composite -->
						<div class="mb-6 flex items-center gap-8">
							<label class="flex items-center gap-2">
								<input
									type="radio"
									name="conditionMode"
									value="logical"
									bind:group={conditionMode}
									class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-base">Logical</span>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="radio"
									name="conditionMode"
									value="composite"
									bind:group={conditionMode}
									class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-base">Composite</span>
							</label>
						</div>

						<!-- Dynamic Content Based on Selection -->
						{#if conditionMode === 'logical'}
							<!-- Simple Logical Form -->
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
										/>
									</div>
								</div>
								
								<!-- Update Condition Button (only show in edit mode when operations checkbox is checked) -->
								{#if editingRule && updateOperations}
									<div class="mt-4 flex justify-end">
										<Button
											type="button"
											onclick={handleUpdateLogicalCondition}
											class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
										>
											Update Condition
										</Button>
									</div>
								{/if}
							</div>
						{:else}
							<!-- Composite Tree Structure -->
							<TreeNodeClean
								node={tree}
								path={[]}
								fields={getAllFields(questionList)}
								operators={getCurrentOperators(logicalConditionField, questionList)}
								onAddLogical={addLogical}
								onAddGroup={addGroup}
								onRemove={removeNode}
								onChangeGroupOperator={updateGroupOperator}
								onChangeLeafField={updateLeafField}
								onChangeLeafOperator={updateLeafOperator}
								onChangeLeafValue={updateLeafValue}
								onChangeLeafName={updateLeafName}
								onChangeExpression={updateExpression}
								errorsByPath={{}}
								collapsedByPath={collapsed}
								onToggleCollapse={toggleCollapse}
								expressionsByPath={expressions}
								readonly={false}
								showOnlyConditions={true}
							/>
						{/if}
					</div>
				{/if}

				<!-- 5. Outcome Section -->
				<div class="mb-6 rounded-lg border border-gray-300 p-6">
					<h3 class="mb-4 text-base font-medium text-gray-900">Outcome</h3>

					<!-- Outcome Type Selection -->
					<div class="mb-6 flex items-center gap-8">
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name="outcomeMode"
								value="static"
								bind:group={outcomeMode}
								class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-base">Static Value</span>
						</label>
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name="outcomeMode"
								value="expression"
								bind:group={outcomeMode}
								class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-base">Calculation Expression</span>
						</label>
					</div>

					<!-- Outcome Content -->
					{#if outcomeMode === 'static'}
						<div class="space-y-4">
							<div class="space-y-2">
								<Label class="text-sm font-medium text-gray-700">Static Value</Label>
								<Input
									type="text"
									bind:value={staticValue}
									placeholder="Enter static value"
									class="w-full"
								/>
							</div>
							<div class="space-y-2">
								<Label class="text-sm font-medium text-gray-700">Data Type</Label>
								<Select.Root
									type="single"
									bind:value={staticValueDataType}
								>
									<Select.Trigger class="w-full">
										{staticValueDataType}
									</Select.Trigger>
									<Select.Content>
										{#each dataTypes as dataType}
											<Select.Item value={dataType}>{dataType}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<div class="text-xs text-gray-500">
									Select the data type for the static value (Text, Integer, Float, Boolean, Date, DateTime)
								</div>
							</div>
						</div>
					{:else}
						<div class="space-y-3">
							<ExpressionBuilder
								expression={expressions['global'] || ''}
								onExpressionChange={(value) => updateExpression('global', value)}
								fields={getAllFields(questionList)}
								placeholder="Enter the calculation expression..."
								size="default"
								showValidation={true}
								readonly={false}
							/>
						</div>
					{/if}
				</div>

				<!-- Calculation Settings -->
				<div class="mb-6 rounded-lg border-2 border-gray-200 bg-white p-5">
					<div class="mb-4 flex items-center gap-2">
						<Icon icon="lucide:settings" class="h-5 w-5" />
						<h3 class="font-semibold text-slate-700">Calculation Settings</h3>
					</div>
					<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label class="mb-2 block font-semibold text-slate-700">Decimal Places</Label>
							<Select.Root
								type="single"
								name="DecimalPlaces"
								bind:value={decimalPlaces}
							>
								<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
									{decimalPlaces}
								</Select.Trigger>
								<Select.Content>
									{#each ['0', '1', '2', '3', '4'] as places}
										<Select.Item value={places}>{places}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div>
							<Label class="mb-2 block font-semibold text-slate-700">Rounding Method</Label>
							<Select.Root
								type="single"
								name="RoundingMethod"
								bind:value={roundingMethod}
							>
								<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
									{roundingMethod}
								</Select.Trigger>
								<Select.Content>
									{#each roundingMethods as method}
										<Select.Item value={method}>{method}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="mb-4 space-y-3">
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="autoUpdate"
								bind:checked={autoUpdate}
								class="h-4 w-4"
							/>
							<Label for="autoUpdate">Auto-update when dependent fields change</Label>
						</div>
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="showFormula"
								bind:checked={showFormula}
								class="h-4 w-4"
							/>
							<Label for="showFormula">Show formula to users</Label>
						</div>
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="allowManualOverride"
								bind:checked={allowManualOverride}
								class="h-4 w-4"
							/>
							<Label for="allowManualOverride">Allow manual override</Label>
						</div>
					</div>

					<div>
						<Label class="mb-2 block font-semibold text-slate-700">Number Format</Label>
						<div class="flex gap-2">
							{#each numberFormats as format}
								<Button
									type="button"
									variant={numberFormat === format ? 'default' : 'outline'}
									size="sm"
									onclick={() => (numberFormat = format)}
									class="text-xs"
									disabled={false}
								>
									{format === 'number'
										? '1,234.56'
										: format === 'currency'
											? '$1,234.56'
											: format === 'percentage'
												? '12.34%'
												: '1.23e+3'}
								</Button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Fallback Rules Section -->
				<div class="mb-6 rounded-lg border-2 border-gray-200 bg-white p-5">
					<div class="mb-4 flex items-center gap-2">
						<Icon icon="lucide:shield-alert" class="h-5 w-5" />
						<h3 class="text-base font-medium text-gray-900">Fallback Rules</h3>
					</div>
					
					<div class="space-y-4">
						<p class="text-sm text-gray-600">
							Define what should happen when this calculation rule fails or encounters an error.
						</p>
						<FallbackRuleInput
							bind:action={fallbackAction}
							bind:actionMessage={fallbackActionMessage}
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
					Save Calculation Rule
				</Button>
			</div>
		</div>
	</div>
{/if}
