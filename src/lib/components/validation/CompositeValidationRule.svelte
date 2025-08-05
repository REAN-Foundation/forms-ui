<script lang="ts">
	import {
		logicalOperationSchema,
		LogicalOperatorType,
		OperationType
	} from './logical-operation-schema.js';
	import { compositionOperationSchema } from './composition-operation-schema.js';
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';

	// Props
	let {
		isEditing = false,
		editingRule = null,
		currentField,
		ruleName = '',
		ruleDescription = '',
		questionList,
		compositeConditions = [],
		compositeOperator = 'And',
		shouldTriggerSave = $bindable(false),
		handleCompositeCompositionCreated
	} = $props();

	// State
	let errors = $state({} as Record<string, string>);
	let isProcessing = $state(false);

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

	// Composition operators
	const compositionOperators = [
		{ value: 'And', label: 'AND (All conditions must be true)' },
		{ value: 'Or', label: 'OR (At least one condition must be true)' },
		{ value: 'Xor', label: 'XOR (Exactly one condition must be true)' }
	];

	function addCompositeCondition() {
		compositeConditions = [
			...compositeConditions,
			{
				field: 'Select Field',
				operator: '',
				value: ''
			}
		];
	}

	function removeCompositeCondition(index: number) {
		compositeConditions = compositeConditions.filter((_, i) => i !== index);
	}

	function updateCompositeCondition(index: number, field: string, value: string) {
		compositeConditions[index] = { ...compositeConditions[index], [field]: value };
		compositeConditions = [...compositeConditions];
	}

	async function handleSave() {
		console.log('handleSave called with compositeConditions:', compositeConditions);
		// Reset errors
		errors = {} as Record<string, string>;

		// // Validate required fields (only when not editing)
		// if (!isEditing) {
		// 	if (!compositeConditions || compositeConditions.length === 0) {
		// 		errors.compositeConditions = 'At least one condition is required';
		// 	} else {
		// 		// For now, only validate the first condition (single operation)
		// 		const condition = compositeConditions[0];
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
		// 	if (compositeConditions.length > 0) {
		// 		// For now, only validate the first condition (single operation)
		// 		const condition = compositeConditions[0];
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
			// Step 1: Create logical operations for each condition
			const logicalOperations = [];
			const createdOperationIds = [];

			for (let i = 0; i < compositeConditions.length; i++) {
				const condition = compositeConditions[i];
				
				// Find the field data for this specific condition
				let fieldData = null;
				for (const section of questionList) {
					for (const field of section.FormFields) {
						if (field.Title === condition.field || field.DisplayCode === condition.field) {
							fieldData = field;
							break;
						}
					}
					if (fieldData) break;
				}

				// If no field found, use currentField as fallback
				if (!fieldData) {
					fieldData = currentField;
				}

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

				// Create logical operation
				// const logicalOperation = {
				// 	Name: `${ruleName || 'New Composite Rule'} - Logical validation ${i + 1}`,
				// 	Description: `${ruleDescription || 'Logical validation condition'} ${i + 1}`,
				// 	Type: OperationType.Logical,
				// 	Operator: operatorType,
				// 	Operands: JSON.stringify(operands)
				// };

				// // Validate the logical operation
				// const result = await logicalOperationSchema.safeParseAsync(logicalOperation);
				// if (!result.success) {
				// 	console.error(`Logical operation ${i + 1} validation failed:`, result.error);
				// 	errors.general = 'Invalid logical operation structure';
				// 	return;
				// }

				// Create logical operation
				// const logicalResponse = await fetch('/api/server/operations/logical-operation', {
				// 	method: 'POST',
				// 	body: JSON.stringify(logicalOperation),
				// 	headers: { 'content-type': 'application/json' }
				// });

				// if (!logicalResponse.ok) {
				// 	const errorData = await logicalResponse.json();
				// 	toastMessage(errorData);
				// 	throw new Error(errorData.Message || `Failed to create logical operation ${i + 1}`);
				// }

				// const logicalData = await logicalResponse.json();
				// createdOperationIds.push(logicalData.Data.id);
				// logicalOperations.push(logicalOperation);
				// console.log(`Logical operation ${i + 1} created successfully:`, logicalData);
			}

			// Step 2: Create composition operation
			const compositionOperation = {
				Name: `${ruleName || 'New Composite Rule'} - Composite validation`,
				Description: `${ruleDescription || 'Composite validation combining multiple conditions'}`,
				Type: OperationType.Composition,
				Operator: compositeOperator,
				Children: JSON.stringify(createdOperationIds) // Convert array to JSON string
			};

			// Validate the composition operation
			const compositionResult = await compositionOperationSchema.safeParseAsync(compositionOperation);
			if (!compositionResult.success) {
				console.error('Composition operation validation failed:', compositionResult.error);
				errors.general = 'Invalid composition operation structure';
				return;
			}

			// Create composition operation
			const compositionResponse = await fetch('/api/server/operations/composition-operation', {
				method: 'POST',
				body: JSON.stringify(compositionOperation),
				headers: { 'content-type': 'application/json' }
			});

			if (!compositionResponse.ok) {
				const errorData = await compositionResponse.json();
				toastMessage(errorData);
				throw new Error(errorData.Message || 'Failed to create composition operation');
			}

			const compositionData = await compositionResponse.json();
			console.log('Composition operation created successfully:', compositionData);

			// Dispatch the complete workflow data to parent
			handleCompositeCompositionCreated({
				detail: {
					// operationId: createdOperationIds,
					operationId: compositionData.Data.id,
					operationType: OperationType.Composition,
					// logicalOperations: logicalOperations,
					operation: compositionOperation
				}
			});

		} catch (error) {
			console.error('Error creating composite validation workflow:', error);
			errors.general = error.message;
		}
	}

	async function handleEdit() {
		// Reset errors
		errors = {} as Record<string, string>;

		// When editing, all fields are optional - only validate conditions if they exist and are incomplete
		if (compositeConditions.length > 0) {
			// For now, only validate the first condition (single operation)
			const condition = compositeConditions[0];
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
			const finalRuleName = ruleName || 'Updated Composite Rule';
			const finalRuleDescription = ruleDescription || 'Updated composite validation';

			// For now, only handle single operation (first condition)
			const condition =
				compositeConditions.length > 0
					? compositeConditions[0]
					: {
							field:
								questionList.length > 0
									? questionList[0].Title || questionList[0].DisplayCode
									: 'Default Field',
							operator: 'Equal To',
							value: ''
						};

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
				case 'Is Empty':
					operatorType = LogicalOperatorType.Exists;
					break;
				case 'Is Not Empty':
					operatorType = LogicalOperatorType.Exists;
					break;
				case 'Greater Than':
					operatorType = LogicalOperatorType.GreaterThan;
					break;
				case 'Less Than':
					operatorType = LogicalOperatorType.LessThan;
					break;
				case 'Equal To':
					operatorType = LogicalOperatorType.Equal;
					break;
				case 'Not Equal To':
					operatorType = LogicalOperatorType.NotEqual;
					break;
				case 'Contains':
					operatorType = LogicalOperatorType.Contains;
					break;
				case 'Does Not Contain':
					operatorType = LogicalOperatorType.DoesNotContain;
					break;
				case 'Greater Than or Equal':
					operatorType = LogicalOperatorType.GreaterThanOrEqual;
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
				console.error('Logical operation validation failed:', result.error);
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
					// throw new Error(errorData.Message || 'Failed to update composite operation');
				}

				const operationData = await response.json();
				console.log('Logical operation updated successfully:', operationData);

				// Dispatch the operation data to parent for update
				// handleCompositeCompositionUpdated({ detail: { operationId: operationId, operationType: OperationType.Logical, operation: operationToUpdate } })
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

<!-- Composite Validation UI -->
<div class="mb-5 rounded-lg bg-gray-50 p-5">
	<h3 class="mb-4 font-medium text-slate-700">Composite Validation</h3>

	<!-- Composition Operator Selection -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Composition Operator</Label>
		<Select.Root type="single" bind:value={compositeOperator}>
			<Select.Trigger class="w-full">
				{compositeOperator || 'Select Operator'}
			</Select.Trigger>
			<Select.Content>
				{#each compositionOperators as op}
					<Select.Item value={op.value}>{op.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Composite Conditions -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Composite Conditions</Label>
		{#each compositeConditions as condition, index}
			<div class="mb-3 flex items-center gap-2 rounded-md border bg-white p-3">
				<!-- Field Selection -->
				<Select.Root type="single" bind:value={condition.field}>
					<Select.Trigger class="flex-1">
						{condition.field || 'Select Field'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="Select Field">Select Field</Select.Item>
						{#each questionList as field}
							{#each field.FormFields as f}
								<Select.Item value={f.Title || f.DisplayCode}
									>{f.Title || f.DisplayCode}</Select.Item
								>
							{/each}
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors[`condition${index}Field`]}
					<p class="text-sm text-red-500">{errors[`condition${index}Field`]}</p>
				{/if}

				<!-- Operator Selection -->
				<Select.Root type="single" bind:value={condition.operator}>
					<Select.Trigger class="flex-1">
						{condition.operator || 'Select Operator'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="">Select Operator</Select.Item>
						{#each operators as operator}
							<Select.Item value={operator}>{operator}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors[`condition${index}Operator`]}
					<p class="text-sm text-red-500">{errors[`condition${index}Operator`]}</p>
				{/if}

				<!-- Value Input (only for operators that need it) -->
				{#if condition.operator && condition.operator !== 'Is Empty' && condition.operator !== 'Is Not Empty'}
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

				<!-- Remove Condition Button -->
				{#if compositeConditions.length > 1}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => removeCompositeCondition(index)}
						class="text-red-600 hover:text-red-700"
					>
						<Icon icon="mdi:close" class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Add Condition Button -->
	<Button type="button" variant="outline" onclick={addCompositeCondition} class="mt-4">
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
