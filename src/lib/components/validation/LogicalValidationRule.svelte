<script lang="ts">
	import {
		logicalOperationSchema,
		LogicalOperatorType,
		OperationType
	} from './logical-operation-schema.js';
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';

	////////////////////////////////////////////////////////////////////////////////////////////////

	// Props
	let {
		isEditing = false,
		editingRule = null,
		currentField,
		ruleName = '',
		ruleDescription = '',
		questionList,
		conditions = [],
		shouldTriggerSave = $bindable(false),
		handleLogicalOperationsCreated
	} = $props();

	// State
	let errors = $state({} as Record<string, string>);
	let isProcessing = $state(false);
	let referenceFieldCode = $state(currentField.Title || currentField.DisplayCode);

	// Watch for save trigger from parent
	$effect(() => {
		if (shouldTriggerSave && !isProcessing) {
			isProcessing = true;
			(async () => {
				try {
					if (isEditing) {
						await handleEdit();
					} else {
						await handleSave();
					}
				} catch (error) {
					console.error('Error in save/edit operation:', error);
					// Don't throw here, just log the error
				} finally {
					isProcessing = false;
					// Always reset the trigger flag to prevent infinite loops
					shouldTriggerSave = false;
				}
			})();
		}
	});

	// Logical operators
	const operators = [
		'Is Empty',
		'Is Not Empty',
		'Greater Than',
		'Less Than',
		'Equal To',
		'Not Equal To',
		'Contains',
		'Does Not Contain',
		'Greater Than or Equal',
		'Less Than or Equal'
	];

	function addCondition() {
		conditions = [
			...conditions,
			{
				field: '',
				operator: '',
				value: ''
			}
		];
	}

	function removeCondition(index: number) {
		conditions = conditions.filter((_, i) => i !== index);
	}

	function updateCondition(index: number, field: string, value: string) {
		conditions[index] = { ...conditions[index], [field]: value };
		conditions = [...conditions];
	}

	async function handleSave() {
		console.log('handleSave called with conditions:', conditions);
		// Reset errors
		errors = {} as Record<string, string>;

		// // Validate required fields (only when not editing)
		// if (!isEditing) {
		// 	if (!conditions || conditions.length === 0) {
		// 		errors.conditions = 'At least one condition is required';
		// 	} else {
		// 		// For now, only validate the first condition (single operation)
		// 		const condition = conditions[0];
		// 		if (!condition.field || condition.field === 'Select Field') {
		// 			errors.condition0Field = 'Please select a field';
		// 		}
		// 		if (!condition.operator) {
		// 			errors.condition0Operator = 'Please select an operator';
		// 		}
		// 		if (
		// 			condition.operator &&
		// 			condition.operator !== 'Is Empty' &&
		// 			condition.operator !== 'Is Not Empty' &&
		// 			!condition.value
		// 		) {
		// 			errors.condition0Value = 'Value is required for this operator';
		// 		}
		// 	}
		// } else {
		// 	// When editing, only validate conditions if they exist and are incomplete
		// 	if (conditions.length > 0) {
		// 		// For now, only validate the first condition (single operation)
		// 		const condition = conditions[0];
		// 		// Only validate if the condition has some data but is incomplete
		// 		if (condition.field && condition.field !== 'Select Field' && !condition.operator) {
		// 			errors.condition0Operator = 'Please select an operator';
		// 		}
		// 		if (
		// 			condition.field &&
		// 			condition.field !== 'Select Field' &&
		// 			condition.operator &&
		// 			condition.operator !== 'Is Empty' &&
		// 			condition.operator !== 'Is Not Empty' &&
		// 			!condition.value
		// 		) {
		// 			errors.condition0Value = 'Value is required for this operator';
		// 		}
		// 	}
		// }

		// If there are validation errors, don't proceed
		if (Object.keys(errors).length > 0) {
			console.log('Validation errors:', errors);
			return;
		}

		try {
			// For now, only handle single operation (first condition)
			const condition = conditions[0];
			
			// Use currentField directly since it's already the selected field
			const fieldData = currentField;

			// Map operator to LogicalOperatorType
			let operatorType;
			switch (condition.operator) {
				case 'Is Equal':
					operatorType = LogicalOperatorType.Equal;
					break;
				case 'Is Not Equal':
					operatorType = LogicalOperatorType.NotEqual;
					break;
				case 'Greater Than or Equal':
					operatorType = LogicalOperatorType.GreaterThanOrEqual;
					break;
				case 'Greater Than':
					operatorType = LogicalOperatorType.GreaterThan;
					break;
				case 'Less Than':
					operatorType = LogicalOperatorType.LessThan;
					break;
				case 'Contains':
					operatorType = LogicalOperatorType.Contains;
					break;
				case 'Does Not Contain':
					operatorType = LogicalOperatorType.DoesNotContain;
					break;
				case 'Less Than or Equal':
					operatorType = LogicalOperatorType.LessThanOrEqual;
					break;
				case 'In':
					operatorType = LogicalOperatorType.In;
					break;
				case 'Not In':
					operatorType = LogicalOperatorType.NotIn;
					break;
				case 'Between':
					operatorType = LogicalOperatorType.Between;
					break;
				case 'Is True':
					operatorType = LogicalOperatorType.IsTrue;
					break;
				case 'Is False':
					operatorType = LogicalOperatorType.IsFalse;
					break;
				case 'Exists':
					operatorType = LogicalOperatorType.Exists;
					break;
				case 'Has Consecutive Occurrences':
					operatorType = LogicalOperatorType.HasConsecutiveOccurrences;
					break;
				case 'Ranges Overlap':
					operatorType = LogicalOperatorType.RangesOverlap;
					break;
				case 'None':
					operatorType = LogicalOperatorType.None;
					break;
				default:
					operatorType = LogicalOperatorType.Equal;
			}

			// Build operands array
			const operands: any[] = [
				{
					Type: 'FieldReference',
					DataType: fieldData?.ResponseType || 'Text',
					FieldId: fieldData?.id || '',
					FieldCode: fieldData?.DisplayCode || ''
				}
			];

			// Add value operand for operators that need it
			if (condition.operator !== 'Is Empty' && condition.operator !== 'Is Not Empty') {
				operands.push({
					Type: 'Constant',
					DataType: fieldData?.ResponseType || 'Text',
					Value: condition.value
				});
			}

			// Step 1: Create single logical operation
			const operation = {
				Name: `${ruleName || 'New Logical Rule'} - Logical validation`,
				Description: `${ruleDescription || 'Logical validation condition'}`,
				Type: OperationType.Logical,
				Operator: operatorType,
				Operands: JSON.stringify(operands)
			};

			// Validate the operation
			const result = await logicalOperationSchema.safeParseAsync(operation);
			if (!result.success) {
				console.error('Logical operation validation failed:', result.error);
				errors.general = 'Invalid operation structure';
				return;
			}

			// Create operation
			const operationResponse = await fetch('/api/server/operations/logical-operation', {
				method: 'POST',
				body: JSON.stringify(operation),
				headers: { 'content-type': 'application/json' }
			});

			if (!operationResponse.ok) {
				const errorData = await operationResponse.json();
				toastMessage(errorData);
				throw new Error(errorData.Message || 'Failed to create logical operation');
			}

			const operationData = await operationResponse.json();
			console.log('Logical operation created successfully:', operationData);

			// Dispatch the complete workflow data to parent
			handleLogicalOperationsCreated({
				detail: {
					operationId: operationData.Data.id,
					operationType: OperationType.Logical,
					operation: operation
				}
			});
		} catch (error) {
			console.error('Error creating logical validation workflow:', error);
			errors.general = error.message;
		}
	}

	async function handleEdit() {
		// Reset errors
		errors = {} as Record<string, string>;

		// When editing, all fields are optional - only validate conditions if they exist and are incomplete
		if (conditions.length > 0) {
			// For now, only validate the first condition (single operation)
			const condition = conditions[0];
			// Only validate if the condition has some data but is incomplete
			if (condition.field && condition.field !== 'Select Field' && !condition.operator) {
				errors.condition0Operator = 'Please select an operator';
			}
			if (
				condition.field &&
				condition.field !== 'Select Field' &&
				condition.operator &&
				condition.operator !== 'Is Empty' &&
				condition.operator !== 'Is Not Empty' &&
				!condition.value
			) {
				errors.condition0Value = 'Value is required for this operator';
			}
		}

		// If there are validation errors, don't proceed
		if (Object.keys(errors).length > 0) {
			console.log('Validation errors:', errors);
			return;
		}

		try {
			// When editing, use props for rule name and description
			const finalRuleName = ruleName || 'Updated Logical Rule';
			const finalRuleDescription = ruleDescription || 'Updated logical validation';

			// If no conditions provided, create a default condition
			const finalConditions =
				conditions.length > 0
					? conditions
					: [
							{
								field:
									questionList.length > 0
										? questionList[0].Title || questionList[0].DisplayCode
										: 'Default Field',
								operator: 'Equal To',
								value: ''
							}
						];

			// For now, only handle single operation (first condition)
			const condition = finalConditions[0];

			// Find the field data
			const fieldData = questionList.find(
				(field) =>
					field.Title?.toLowerCase() === condition.field.toLowerCase() ||
					field.DisplayCode?.toLowerCase() === condition.field.toLowerCase()
			) ||
				questionList[0] || { ResponseType: 'Text', id: '', DisplayCode: '' };

			// Map operator to LogicalOperatorType
			let operatorType;
			switch (condition.operator) {
				case 'Is Equal':
					operatorType = LogicalOperatorType.Equal;
					break;
				case 'Is Not Equal':
					operatorType = LogicalOperatorType.NotEqual;
					break;
				case 'Greater Than or Equal':
					operatorType = LogicalOperatorType.GreaterThanOrEqual;
					break;
				case 'Greater Than':
					operatorType = LogicalOperatorType.GreaterThan;
					break;
				case 'Less Than':
					operatorType = LogicalOperatorType.LessThan;
					break;
				case 'Contains':
					operatorType = LogicalOperatorType.Contains;
					break;
				case 'Does Not Contain':
					operatorType = LogicalOperatorType.DoesNotContain;
					break;
				case 'Less Than or Equal':
					operatorType = LogicalOperatorType.LessThanOrEqual;
					break;
				case 'In':
					operatorType = LogicalOperatorType.In;
					break;
				case 'Not In':
					operatorType = LogicalOperatorType.NotIn;
					break;
				case 'Contains':
					operatorType = LogicalOperatorType.Contains;
					break;
				case 'Does Not Contain':
					operatorType = LogicalOperatorType.DoesNotContain;
					break;
				case 'Between':
					operatorType = LogicalOperatorType.Between;
					break;
				case 'Is True':
					operatorType = LogicalOperatorType.IsTrue;
					break;
				case 'Is False':
					operatorType = LogicalOperatorType.IsFalse;
					break;
				case 'Exists':
					operatorType = LogicalOperatorType.Exists;
					break;
				case 'Has Consecutive Occurrences':
					operatorType = LogicalOperatorType.HasConsecutiveOccurrences;
					break;
				case 'Ranges Overlap':
					operatorType = LogicalOperatorType.RangesOverlap;
					break;
				case 'None':
					operatorType = LogicalOperatorType.None;
					break;
				default:
					operatorType = LogicalOperatorType.Equal;
			}

			// Build operands based on operator type
			const operands = [];

			// Always add the field reference as first operand
			operands.push({
				Type: 'FieldReference',
				DataType: fieldData.ResponseType || 'Text',
				FieldId: fieldData.id || '',
				FieldCode: fieldData.DisplayCode || ''
			});

			// Add value operand for operators that need it
			if (condition.operator !== 'Is Empty' && condition.operator !== 'Is Not Empty') {
				operands.push({
					Type: 'Constant',
					DataType: fieldData.ResponseType || 'Text',
					Value: condition.value || ''
				});
			}

			const operation = {
				Name: `${finalRuleName} - Logical validation`,
				Description: `${finalRuleDescription} - Logical validation condition`,
				Type: OperationType.Logical,
				Operator: operatorType,
				Operands: JSON.stringify(operands)
			};

			// Validate the operation
			const result = await logicalOperationSchema.safeParseAsync(operation);
			if (!result.success) {
				console.error(`Logical operation validation failed:`, result.error);
				errors.general = 'Invalid operation structure';
				return;
			}

			// Get the original rule data to extract operation ID
			const originalRule = editingRule.originalRule;
			let operationId = null;

			// Try to extract operation ID from the rule
			if (originalRule && originalRule.OperationId) {
				operationId = originalRule.OperationId;
			}

			if (operationId) {
				// Update the existing operation
				const operationEndpoint = `/api/server/operations/logical-operation/${operationId}`;

				const response = await fetch(operationEndpoint, {
					method: 'PUT',
					body: JSON.stringify(operation),
					headers: { 'content-type': 'application/json' }
				});

				if (!response.ok) {
					const errorData = await response.json();
					toastMessage(errorData);
					// throw new Error(errorData.Message || 'Failed to update logical operation');
				}

				const operationData = await response.json();
				console.log('Logical operation updated successfully:', operationData);

				// Dispatch the operation data to parent for update
				// handleLogicalOperationsUpdated({ detail: { operationId: operationId, operationType: OperationType.Logical, operation: operationToUpdate } })
			} else {
				console.log('No operation ID found for editing');
				errors.general = 'No operation ID found for editing';
			}
		} catch (error) {
			console.error('Error updating logical operations:', error);
			errors.general = error.message;
		}
	}
</script>

<!-- Logical Validation UI -->
<div class="mb-5 rounded-lg bg-gray-50 p-5">
	<h3 class="mb-4 font-medium text-slate-700">Logical Validation</h3>

	<!-- Conditions -->
	<div class="space-y-4">
		{#each conditions as condition, index}
			<div class="flex items-center gap-2 rounded-md border bg-white p-3">
				<!-- Field Selection -->

				<div class="mb-4">
					<Label class="mb-2 block text-sm font-medium text-gray-700">Field to Validate</Label>
					<Select.Root type="single" bind:value={currentField.Title}>
						<Select.Trigger class="w-full">
							{currentField ? currentField.Title || currentField.DisplayCode : 'Select a field'}
						</Select.Trigger>
						<Select.Content>
							{#each questionList as field}
								{#each field.FormFields as f}
									<Select.Item value={f.Title || f.DisplayCode}
										>{f.Title || f.DisplayCode}</Select.Item
									>
								{/each}
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errors.selectedField}
						<p class="mt-1 text-sm text-red-500">{errors.selectedField}</p>
					{/if}
				</div>

				<!-- Operator Selection -->
				<Select.Root type="single" bind:value={condition.operator}>
					<Select.Trigger class="flex-1">
						{condition.operator || 'Select Operator'}
					</Select.Trigger>
					<Select.Content>
						{#each operators as op}
							<Select.Item value={op}>{op}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors[`condition${index}Operator`]}
					<p class="text-sm text-red-500">{errors[`condition${index}Operator`]}</p>
				{/if}

				<!-- Value Input (only for operators that need it) -->
				{#if condition.operator !== 'Is Empty' && condition.operator !== 'Is Not Empty'}
					<Input
						type="text"
						bind:value={condition.value}
						placeholder="Enter value"
						class="flex-1"
					/>
					{#if errors[`condition${index}Value`]}
						<p class="text-sm text-red-500">{errors[`condition${index}Value`]}</p>
					{/if}
				{/if}

				<!-- Remove Button -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={() => removeCondition(index)}
					class="text-red-600 hover:text-red-800"
				>
					<Icon icon="mdi:close" class="h-4 w-4" />
				</Button>
			</div>
		{/each}
	</div>

	<!-- Add Condition Button -->
	<Button type="button" variant="outline" onclick={addCondition} class="mt-4">
		<Icon icon="mdi:plus" class="mr-2 h-4 w-4" />
		Add Condition
	</Button>

	<!-- Error Display -->
	{#if errors.general}
		<div class="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
			<p class="text-sm text-red-600">{errors.general}</p>
		</div>
	{/if}
</div>
