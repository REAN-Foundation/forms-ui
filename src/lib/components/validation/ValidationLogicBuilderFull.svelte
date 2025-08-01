<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { Textarea } from '../ui/textarea/index.js';
	import { logicalOperationSchema, LogicalOperatorType } from './logical-operation-schema';
	import { validationRuleSchema, OperationType } from './validation-rule-schema';

	// Props
	let {
		isOpen = $bindable(false),
		onSave,
		onCancel,
		editingRule = null,
		currentField = null,
		questionList
	} = $props();

	// Validation errors state
	let errors = $state({} as Record<string, any>);

	// console.log(currentField);
	// console.log('This is the questionList', questionList);
	// State for form data
	let logicId = $state(currentField?.ValidateLogic?.id || '');
	let validateLogicEnabled = $state(currentField?.ValidateLogic?.Enabled || false);
	let fieldId = $state(currentField?.ValidateLogic?.FieldId || '');
	let logicType = $state(currentField?.ValidateLogic?.Type || '');

	let validationRules = $state(currentField?.ValidateLogic?.Rules || []);

	let ruleName = $state(currentField?.ValidateLogic?.Title || '');
	let ruleDescription = $state('');
	let rulePriority = $state(1);
	let operationType = $state(OperationType.Logical); // Add operation type state
	let activeTab = $state('regex');
	let selectedField = $state('Email');
	let activeRegexPreset = $state('email');
	let regexPattern = $state('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
	let testInput = $state('user@example.com');
	let testResult = $state('✓ Pattern matches the test input');
	let testResultClass = $state('success');
	let messageSeverity = $state('error');
	let errorMessage = $state(
		'Please enter a valid email address and ensure you are at least 18 years old.'
	);
	let successMessage = $state('All validation checks passed successfully!');
	let fallbackAction = $state('Allow submission with warning');

	// Logical validation conditions
	let conditions = $state([
		{ field: 'Select Field', operator: 'Less Than', value: '20', connector: 'AND' },
		{ field: 'Select Field', operator: 'Greater Than', value: '10', connector: 'AND' }
	]);

	// Composite validation conditions
	let compositeConditions = $state([
		{
			field: 'Email',
			operator: 'Matches Regex',
			value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
			connector: 'AND'
		},
		{ field: 'Age', operator: 'Greater Than', value: '18', connector: 'AND' },
		{
			field: 'Phone',
			operator: 'Matches Regex',
			value: '^\\+?1?[-\\.\\s]?\\(?[0-9]{3}\\)?[-\\.\\s]?[0-9]{3}[-\\.\\s]?[0-9]{4}$',
			connector: null
		}
	]);

	// Logical validation fields
	let operator = $state('');
	let fieldReference = $state('');
	let value = $state('');

	// Available fields and operators
	const fields = [
		'Age',
		'Email',
		'Phone',
		'Country',
		'Income',
		'Postal Code',
		'Social Security Number',
		'Custom Field'
	];
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
	const connectors = ['AND', 'OR'];

	// Initialize form data when editing an existing rule
	// $effect(() => {
	//     if (editingRule) {
	//         // Editing existing rule - populate with existing data
	//         ruleName = editingRule.ruleName || '';
	//         activeTab = editingRule.activeTab || 'regex';
	//         errorMessage = editingRule.errorMessage || '';
	//         conditions = editingRule.conditions || [];
	//         compositeConditions = editingRule.compositeConditions || [];
	//         operator = editingRule.operator || '';
	//         fieldReference = editingRule.fieldReference || '';
	//         value = editingRule.value || '';
	//         regexPattern = editingRule.regexPattern || '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
	//         selectedField = editingRule.selectedField || 'Email';
	//         messageSeverity = editingRule.messageSeverity || 'error';
	//         successMessage = editingRule.successMessage || '';
	//         fallbackAction = editingRule.fallbackAction || 'Allow submission with warning';
	//     } else {
	//         // Adding new rule - reset to default values
	//         ruleName = currentField?.ValidateLogic?.Title ? `${currentField.Title} Validation` : 'Field Validation';
	//         activeTab = 'regex';
	//         selectedField = currentField?.Title || 'Current Field';
	//         activeRegexPreset = 'email';
	//         regexPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
	//         testInput = 'user@example.com';
	//         testResult = '✓ Pattern matches the test input';
	//         testResultClass = 'success';
	//         messageSeverity = 'error';
	//         errorMessage = currentField?.Title ? `Please enter a valid ${currentField.Title.toLowerCase()}` : 'Please enter a valid value';
	//         successMessage = 'All validation checks passed successfully!';
	//         fallbackAction = 'Allow submission with warning';

	//         // Reset logical validation conditions
	//         conditions = [
	//             { field: 'Age', operator: 'Is Empty', value: '', connector: 'OR' },
	//             { field: 'Email', operator: 'Does Not Contain', value: '@', connector: 'AND' }
	//         ];

	//         // Reset composite validation conditions
	//         compositeConditions = [
	//             { field: 'Email', operator: 'Matches Regex', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', connector: 'AND' },
	//             { field: 'Age', operator: 'Greater Than', value: '18', connector: 'AND' },
	//             { field: 'Phone', operator: 'Matches Regex', value: '^\\+?1?[-\\.\\s]?\\(?[0-9]{3}\\)?[-\\.\\s]?[0-9]{3}[-\\.\\s]?[0-9]{4}$', connector: null }
	//         ];

	//         // Reset logical validation fields
	//         operator = '';
	//         fieldReference = '';
	//         value = '';
	//     }
	// });

	// Regex patterns
	const regexPatterns = {
		email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
		phone: '^\\+?1?[-\\.\\s]?\\(?[0-9]{3}\\)?[-\\.\\s]?[0-9]{3}[-\\.\\s]?[0-9]{4}$',
		url: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
		number: '^[0-9]+$',
		alphanumeric: '^[a-zA-Z0-9]+$',
		custom: ''
	};

	function showTab(tabName: string) {
		activeTab = tabName;
	}

	function setRegexPattern(type: string) {
		activeRegexPreset = type;
		regexPattern = regexPatterns[type] || '';
	}

	function testRegex() {
		try {
			const regex = new RegExp(regexPattern);
			const isMatch = regex.test(testInput);

			if (isMatch) {
				testResultClass = 'success';
				testResult = '✓ Pattern matches the test input';
			} else {
				testResultClass = 'error';
				testResult = '✗ Pattern does not match the test input';
			}
		} catch (error) {
			testResultClass = 'error';
			testResult = `✗ Invalid regex pattern: ${error.message}`;
		}
	}

	function addCondition() {
		conditions.push({ field: 'Select Field', operator: 'Is Empty', value: '', connector: 'AND' });
	}

	function removeCondition(index: number) {
		conditions.splice(index, 1);
	}

	function addCompositeCondition() {
		compositeConditions.push({
			field: 'Select Field',
			operator: 'Is Empty',
			value: '',
			connector: 'AND'
		});
	}

	function removeCompositeCondition(index: number) {
		compositeConditions.splice(index, 1);
	}

	function setSeverity(severity: string) {
		messageSeverity = severity;
	}

	async function handleSave(event) {
		event?.preventDefault();
		event?.stopPropagation();

		console.log('=== Starting validation save process ===');
		console.log('Current conditions:', conditions);
		console.log('Active tab:', activeTab);

		// Clear previous errors
		errors = {};

		// Validate rule data first (excluding OperationId and LogicId which will be set later)
		const ruleDataForValidation = {
			Name: ruleName,
			Description: ruleDescription,
			Priority: rulePriority,
			IsActive: true,
			OperationType: operationType, // Use the state variable instead of hardcoding
			ErrorWhenFalse: messageSeverity === 'error',
			ErrorMessage: errorMessage
		};

		// Create a temporary schema without OperationId and LogicId for initial validation
		const tempSchema = validationRuleSchema.omit({ OperationId: true, LogicId: true });
		const ruleValidation = await tempSchema.safeParseAsync(ruleDataForValidation);
		if (!ruleValidation.success) {
			console.log('Rule validation error:', ruleValidation.error.flatten().fieldErrors);
			errors.rule = Object.fromEntries(
				Object.entries(ruleValidation.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
			return;
		}

		// Format conditions for backend API
		const operations = [];
		let hasValidationErrors = false;

		console.log('Checking if we should process logical validation...');
		console.log('Active tab is logical:', activeTab === 'logical');
		console.log('Conditions length:', conditions.length);

		if (activeTab === 'logical' && conditions.length > 0) {
			console.log('Processing logical validation conditions...');

			// Check if we have valid conditions (not just "Select Field")
			const validConditions = conditions.filter(
				(condition) =>
					condition.field && condition.field !== 'Select Field' && condition.field !== ''
			);

			console.log('Valid conditions found:', validConditions.length);

			if (validConditions.length === 0) {
				console.log('No valid conditions found. Please select fields for validation.');
				errors.general = 'Please select fields for validation conditions.';
				return;
			}

			for (let i = 0; i < conditions.length; i++) {
				const condition = conditions[i];
				console.log(`Processing condition ${i + 1}:`, condition);

				// Skip conditions with "Select Field"
				if (!condition.field || condition.field === 'Select Field' || condition.field === '') {
					console.log(`Skipping condition ${i + 1} - no field selected`);
					continue;
				}

				// Find the field data from questionList
				let fieldData = null;
				for (const section of questionList) {
					for (const field of section.FormFields) {
						if (field.id === condition.field) {
							fieldData = field;
							break;
						}
					}
					if (fieldData) break;
				}

				if (fieldData) {
					console.log(`Found field data for condition ${i + 1}:`, fieldData);
					// Map operator to backend format
					const operatorMapping = {
						'Is Empty': LogicalOperatorType.Exists,
						'Is Not Empty': LogicalOperatorType.Exists,
						'Greater Than': LogicalOperatorType.GreaterThan,
						'Less Than': LogicalOperatorType.LessThan,
						'Equal To': LogicalOperatorType.Equal,
						'Not Equal To': LogicalOperatorType.NotEqual,
						Contains: LogicalOperatorType.Contains,
						'Does Not Contain': LogicalOperatorType.DoesNotContain,
						'Greater Than or Equal': LogicalOperatorType.GreaterThanOrEqual,
						'Less Than or Equal': LogicalOperatorType.LessThanOrEqual
					};

					const operation = {
						Name: `${fieldData.Title} validation operation`,
						Description: `Check whether ${fieldData.Title.toLowerCase()} is correct`,
						Type: operationType, // Use the selected operation type
						Operator: operatorMapping[condition.operator],
						Operands: JSON.stringify([
							{
								Type: 'FieldReference',
								DataType: fieldData.ResponseType,
								FieldId: fieldData.id,
								FieldCode: fieldData.DisplayCode
							},
							{
								Type: 'Constant',
								DataType: fieldData.ResponseType,
								Value: condition.value,
								FieldCode: fieldData.DisplayCode
							}
						])
					};

					// Validate each operation before adding to array
					const result = await logicalOperationSchema.safeParseAsync(operation);
					if (!result.success) {
						console.log(
							`Validation error for operation ${i + 1}:`,
							result.error.flatten().fieldErrors
						);
						hasValidationErrors = true;
						// Store errors with operation index for display
						errors[`operation_${i}`] = Object.fromEntries(
							Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
								key,
								val?.[0] || ''
							])
						);
					} else {
						operations.push(operation);
					}
				} else {
					// Field not found error
					console.log(`Field not found for condition ${i + 1}. Field ID: ${condition.field}`);
					hasValidationErrors = true;
					errors[`operation_${i}`] = {
						field: 'Selected field not found in question list'
					};
				}
			}
		}

		console.log('Validation errors found:', hasValidationErrors);
		console.log('Operations to create:', operations.length);

		// Only proceed with API calls if all validations pass
		if (!hasValidationErrors && operations.length > 0) {
			try {
				// Step 1: Create logic
				const logicData = {
					Enabled: true,
					FieldId: currentField?.id
				};

				const logicResponse = await fetch('/api/server/logic/validation-logic', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(logicData)
				});

				if (!logicResponse.ok) {
					const errorData = await logicResponse.json().catch(() => ({}));
					throw new Error(
						`Failed to create logic: ${logicResponse.statusText} - ${errorData.message || ''}`
					);
				}

				const logicDataResponse = await logicResponse.json();
				const logicId = logicDataResponse.Data.id;

				console.log('Logic created successfully:', logicId);

				// Step 2: Create operations and rules for each operation
				const createdRules = [];
				for (let i = 0; i < operations.length; i++) {
					const operation = operations[i];
					
					// Create operation
					const response = await fetch('/api/server/operations/logical-operation', {
						method: 'POST',
						body: JSON.stringify(operation),
						headers: { 'content-type': 'application/json' }
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						throw new Error(
							`Failed to create operation: ${response.statusText} - ${errorData.message || ''}`
						);
					}

					const operationData = await response.json();
					console.log(`Operation ${i + 1} created successfully:`, operationData);

					// Create validation rule for this operation
					const ruleData = {
						Name: `${ruleName} - Rule ${i + 1}`,
						Description: `${ruleDescription} - Operation ${i + 1}`,
						Priority: rulePriority,
						IsActive: true,
						OperationType: operationType,
						OperationId: operationData.Data.id, // Use this operation's ID
						ErrorWhenFalse: messageSeverity === 'error',
						ErrorMessage: errorMessage,
						LogicId: logicId
					};

					const ruleResponse = await fetch('/api/server/rules/validation-rule', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(ruleData)
					});

					if (!ruleResponse.ok) {
						const errorData = await ruleResponse.json().catch(() => ({}));
						throw new Error(
							`Failed to create validation rule for operation ${i + 1}: ${ruleResponse.statusText} - ${errorData.message || ''}`
						);
					}

					const ruleDataResponse = await ruleResponse.json();
					console.log(`Validation rule ${i + 1} created successfully:`, ruleDataResponse);
					createdRules.push(ruleDataResponse);
				}

				console.log('All operations and rules created successfully:', createdRules);

				// Step 3: Update form field with validation logic ID
				if (currentField?.id) {
					console.log('Updating form field with validation logic ID:', logicId);
					
					// Create the complete model for the field update (following the same pattern as handleQuestionCardUpdate)
					const fieldUpdateModel = {
						id: currentField.id, // Include all existing field data
						ValidateLogicId: logicId // Add the validation logic ID
					};

					const fieldUpdateResponse = await fetch('/api/server/form-fields', {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(fieldUpdateModel)
					});

					const fieldUpdateDataResponse = await fieldUpdateResponse.json();
					console.log('Form field update response:', fieldUpdateDataResponse);

					if (fieldUpdateDataResponse.HttpCode === 200) {
						console.log('Form field updated successfully with validation logic ID');
					} else {
						console.warn(`Warning: Failed to update form field: ${fieldUpdateDataResponse.Message || 'Unknown error'}`);
						// Don't throw error here as the validation logic was created successfully
					}
				} else {
					console.warn('No current field ID available for updating validation logic');
				}

				// Success - call onSave
				const validationData = {
					ruleName,
					ruleDescription,
					rulePriority,
					activeTab,
					regexPattern,
					conditions,
					compositeConditions,
					messageSeverity,
					errorMessage,
					successMessage,
					fallbackAction,
					operator,
					fieldReference,
					value,
					selectedField,
					operations,
					createdRules: createdRules, // Changed to array of all created rules
					logicId: logicId // Include the logic ID in the response
				};

				onSave?.(validationData);
			} catch (error) {
				console.error('Error in sequential API calls:', error);
				errors.general = error.message;
			}
		}
	}

	function handleCancel(event) {
		event?.preventDefault();
		event?.stopPropagation();
		onCancel?.();
	}
</script>

{#if isOpen}
	<!-- Modal Overlay -->
	<div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
		<!-- Modal -->
		<div class="flex max-h-[90vh] w-[90%] max-w-4xl flex-col rounded-lg bg-white shadow-2xl">
			<!-- Modal Header -->
			<div
				class="flex flex-shrink-0 items-center justify-between rounded-t-lg bg-slate-700 p-5 text-white"
			>
				<h2 class="text-lg font-semibold">Validation Logic Builder</h2>
				<button
					type="button"
					class="rounded p-1 text-2xl text-white hover:bg-slate-600"
					onclick={handleCancel}
				>
					×
				</button>
			</div>

			<!-- Modal Body -->
			<div class="flex-1 overflow-y-auto p-8">
				<!-- General Error Display -->
				{#if errors.general}
					<div class="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
						<div class="font-semibold">Error:</div>
						<div>{errors.general}</div>
					</div>
				{/if}

				<!-- Rule Validation Errors -->
				{#if errors.rule}
					<div class="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
						<div class="font-semibold">Rule Validation Errors:</div>
						{#each Object.entries(errors.rule) as [field, error]}
							<div class="ml-2">• {field}: {error}</div>
						{/each}
					</div>
				{/if}

				<!-- Rule Name -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Name</Label>
					<Input
						bind:value={ruleName}
						placeholder="Enter rule name"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm focus:border-blue-500"
					/>
					<div class="mt-1 text-xs text-gray-500">(Maximum 100 characters)</div>
					{#if errors.rule?.Name}
						<p class="mt-1 text-sm text-destructive">{errors.rule.Name}</p>
					{/if}
				</div>

				<!-- Rule Description -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Description</Label>
					<Textarea
						bind:value={ruleDescription}
						placeholder="Enter rule description"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm focus:border-blue-500"
						rows={3}
					/>
					<div class="mt-1 text-xs text-gray-500">(Maximum 500 characters)</div>
					{#if errors.rule?.Description}
						<p class="mt-1 text-sm text-destructive">{errors.rule.Description}</p>
					{/if}
				</div>

				<!-- Rule Priority -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Priority</Label>
					<Input
						bind:value={rulePriority}
						type="number"
						min="0"
						placeholder="Enter priority (0 or higher)"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm focus:border-blue-500"
						oninput={(event: Event) => {
							const target = event.target as HTMLInputElement;
							rulePriority = parseInt(target.value) || 0;
						}}
					/>
					<div class="mt-1 text-xs text-gray-500">(Higher numbers have higher priority)</div>
					{#if errors.rule?.Priority}
						<p class="mt-1 text-sm text-destructive">{errors.rule.Priority}</p>
					{/if}
				</div>

				<!-- Operation Type -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Operation Type</Label>
					<Select.Root type="single" name="OperationType" bind:value={operationType}>
						<Select.Trigger
							class="w-full rounded-md border-2 border-gray-200 p-3 text-sm focus:border-blue-500"
						>
							{operationType}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value={OperationType.Logical}>Logical</Select.Item>
							<Select.Item value={OperationType.Mathematical}>Mathematical</Select.Item>
							<Select.Item value={OperationType.Composition}>Composition</Select.Item>
							<Select.Item value={OperationType.Iterate}>Iterate</Select.Item>
							<Select.Item value={OperationType.FunctionExpression}>Function Expression</Select.Item
							>
						</Select.Content>
					</Select.Root>
					<div class="mt-1 text-xs text-gray-500">(Type of operation for this validation rule)</div>
					{#if errors.rule?.OperationType}
						<p class="mt-1 text-sm text-destructive">{errors.rule.OperationType}</p>
					{/if}
				</div>

				<!-- Validation Type Tabs -->
				<div class="mb-5 flex border-b-2 border-gray-200">
					<button
						type="button"
						class="border-b-3 px-6 py-3 font-semibold transition-all duration-200 {activeTab ===
						'regex'
							? 'border-blue-500 text-slate-700'
							: 'border-transparent text-gray-500 hover:text-slate-700'}"
						onclick={() => showTab('regex')}
					>
						Regex Validation
					</button>
					<button
						type="button"
						class="border-b-3 px-6 py-3 font-semibold transition-all duration-200 {activeTab ===
						'logical'
							? 'border-blue-500 text-slate-700'
							: 'border-transparent text-gray-500 hover:text-slate-700'}"
						onclick={() => showTab('logical')}
					>
						Logical Validation
					</button>
					<button
						type="button"
						class="border-b-3 px-6 py-3 font-semibold transition-all duration-200 {activeTab ===
						'composite'
							? 'border-blue-500 text-slate-700'
							: 'border-transparent text-gray-500 hover:text-slate-700'}"
						onclick={() => showTab('composite')}
					>
						Composite Validation
					</button>
				</div>

				<!-- Regex Validation Tab -->
				{#if activeTab === 'regex'}
					<div class="mb-5 rounded-md border-2 border-gray-200 bg-white p-5">
						<h3 class="mb-4 font-medium text-slate-700">Regular Expression Validation</h3>

						<div class="mb-6">
							<Label class="mb-2 block font-semibold text-slate-700">Field to Validate</Label>
							<div class="w-full rounded-md border-2 border-gray-200 bg-gray-50 p-3 text-sm">
								{#if currentField}
									<div class="font-medium text-gray-800">
										{currentField.Title || 'Current Field'}
									</div>
									<div class="mt-1 text-xs text-gray-600">
										Type: {currentField.ResponseType || 'Text'}
									</div>
								{:else}
									<div class="text-gray-500">Current field information not available</div>
								{/if}
							</div>
						</div>

						<div class="mb-6">
							<Label class="mb-2 block font-semibold text-slate-700">Validation Pattern</Label>
							<div class="mb-4 flex flex-wrap gap-2">
								{#each Object.keys(regexPatterns) as preset}
									<button
										type="button"
										class="rounded border px-4 py-2 text-sm font-medium transition-colors {activeRegexPreset ===
										preset
											? 'border-blue-500 bg-blue-500 text-white'
											: 'border-gray-300 bg-gray-50 hover:bg-gray-100'}"
										onclick={() => setRegexPattern(preset)}
									>
										{preset.charAt(0).toUpperCase() + preset.slice(1)}
									</button>
								{/each}
							</div>

							<div class="mb-4 flex gap-2">
								<Input
									bind:value={regexPattern}
									placeholder="Enter regex pattern"
									class="flex-1 rounded border border-gray-300 p-2 font-mono text-sm "
								/>
								<Button
									type="button"
									onclick={testRegex}
									class="rounded bg-green-600 px-5 py-2 text-sm text-white hover:bg-green-700"
								>
									Test Pattern
								</Button>
							</div>

							<div class="mb-4">
								<Label class="mb-2 block font-semibold text-slate-700">Test Input</Label>
								<Input
									bind:value={testInput}
									placeholder="Enter test value"
									class="w-full rounded-md border-2 border-gray-200 p-3 text-sm "
								/>
							</div>

							<div
								class="mt-2 rounded p-2 text-sm {testResultClass === 'success'
									? 'border border-green-300 bg-green-100 text-green-800'
									: 'border border-red-300 bg-red-100 text-red-800'}"
							>
								{testResult}
							</div>

							<div class="mt-2 rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
								<div class="mb-1 flex justify-between">
									<span>Email:</span>
									<span class="rounded bg-gray-200 px-1 font-mono"
										>{'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'}</span
									>
								</div>
								<div class="mb-1 flex justify-between">
									<span>Phone (US):</span>
									<span class="rounded bg-gray-200 px-1 font-mono"
										>{'^\\+?1?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}$'}</span
									>
								</div>
								<div class="flex justify-between">
									<span>Postal Code:</span>
									<span class="rounded bg-gray-200 px-1 font-mono"
										>^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$</span
									>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Logical Validation Tab -->
				{#if activeTab === 'logical'}
					<div class="mb-5 rounded-lg bg-gray-50 p-5">
						<div class="mb-5 flex items-center">
							<div
								class="mr-4 min-w-[60px] rounded bg-gray-600 px-4 py-2 text-center font-semibold text-white"
							>
								IF
							</div>
							<span>Define validation conditions</span>
						</div>

						<div class="mb-4 rounded-md border-2 border-gray-200 bg-white p-4">
							{#each conditions as condition, index}
								<div class="mb-4 flex items-center gap-2">
									<Select.Root type="single" name="FieldToValidate" bind:value={condition.field}>
										<Select.Trigger
											class="min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm "
										>
											{condition.field || 'Select Field'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="Select Field">Select Field</Select.Item>
											{#each questionList as field}
												{#each field.FormFields as formField}
													<Select.Item value={formField.id}
														>{formField.Title} - {formField.DisplayCode}</Select.Item
													>
												{/each}
											{/each}
										</Select.Content>
									</Select.Root>

									<Select.Root type="single" name="Operator" bind:value={condition.operator}>
										<Select.Trigger
											class="min-w-[120px] rounded border border-gray-300 px-3 py-2 text-sm "
										>
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
										class="min-w-[150px] rounded border border-gray-300 px-3 py-2 text-sm "
									/>

									<Button
										type="button"
										onclick={() => removeCondition(index)}
										variant="destructive"
										size="sm"
										class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
									>
										Remove
									</Button>
								</div>

								<!-- Error display for this condition -->
								{#if errors[`operation_${index}`]}
									<div
										class="mb-2 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800"
									>
										<div class="font-semibold">Validation Errors for Condition {index + 1}:</div>
										{#each Object.entries(errors[`operation_${index}`]) as [field, error]}
											<div class="ml-2">• {field}: {error}</div>
										{/each}
									</div>
								{/if}

								{#if index < conditions.length - 1}
									<div class="my-2 flex items-center justify-center">
										<Select.Root type="single" name="Connector" bind:value={condition.connector}>
											<Select.Trigger
												class="max-w-[120px] rounded border border-gray-300 bg-gray-200 px-3 py-1 font-semibold"
											>
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
								class="flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
							>
								<Icon icon="lucide:plus" class="h-4 w-4" />
								Add Condition
							</Button>
						</div>
					</div>
				{/if}

				<!-- Composite Validation Tab -->
				{#if activeTab === 'composite'}
					<div class="mb-5 rounded-lg bg-gray-50 p-5">
						<div class="mb-5 flex items-center">
							<div
								class="mr-4 min-w-[60px] rounded bg-gray-600 px-4 py-2 text-center font-semibold text-white"
							>
								IF
							</div>
							<span>Combine multiple validation types</span>
						</div>

						<div class="mb-4 rounded-md border-2 border-gray-200 bg-white p-4">
							{#each compositeConditions as condition, index}
								<div class="mb-4 flex items-center gap-2">
									<Select.Root type="single" name="FieldToValidate" bind:value={condition.field}>
										<Select.Trigger
											class="min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm "
										>
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
										<Select.Trigger
											class="min-w-[120px] rounded border border-gray-300 px-3 py-2 text-sm "
										>
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
										placeholder={condition.operator.includes('Regex')
											? 'Enter regex pattern'
											: 'Enter value'}
										class="min-w-[150px] rounded border border-gray-300 px-3 py-2 text-sm "
									/>

									<Button
										type="button"
										onclick={() => removeCompositeCondition(index)}
										variant="destructive"
										size="sm"
										class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
									>
										Remove
									</Button>
								</div>

								{#if index < compositeConditions.length - 1}
									<div class="my-2 flex items-center justify-center">
										<Select.Root type="single" name="Connector" bind:value={condition.connector}>
											<Select.Trigger
												class="rounded border border-gray-300 bg-gray-200 px-3 py-1 font-semibold"
											>
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
								onclick={addCompositeCondition}
								class="flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
							>
								<Icon icon="lucide:plus" class="h-4 w-4" />
								Add Condition
							</Button>
						</div>
					</div>
				{/if}

				<!-- Validation Messages Section -->
				<div class="mb-5 rounded-md border-2 border-gray-200 bg-white p-4">
					<h3 class="mb-4 font-medium text-slate-700">Validation Messages</h3>

					<div class="mb-4">
						<Label class="mb-2 block font-semibold text-slate-700">Message Severity</Label>
						<div class="mb-4 flex gap-2">
							<Button
								type="button"
								class="py- cursor-pointer rounded-full border px-5 text-xs font-semibold transition-transform {messageSeverity ===
								'error'
									? 'scale-105 border-red-300 bg-red-100 text-red-800 shadow-sm'
									: 'border-red-300 bg-red-100 text-red-800'}"
								onclick={() => setSeverity('error')}
							>
								Error
							</Button>
							<Button
								type="button"
								class="cursor-pointer rounded-full border px-5 py-1 text-xs font-semibold transition-transform {messageSeverity ===
								'warning'
									? 'scale-105 border-yellow-300 bg-yellow-100 text-yellow-800 shadow-sm'
									: 'border-yellow-300 bg-yellow-100 text-yellow-800'}"
								onclick={() => setSeverity('warning')}
							>
								Warning
							</Button>
							<Button
								type="button"
								class="cursor-pointer rounded-full border px-5 py-1 text-xs font-semibold transition-transform {messageSeverity ===
								'info'
									? 'scale-105 border-blue-300 bg-blue-100 text-blue-800 shadow-sm'
									: 'border-blue-300 bg-blue-100 text-blue-800'}"
								onclick={() => setSeverity('info')}
							>
								Info
							</Button>
						</div>
					</div>

					<div class="mb-4">
						<Label class="mb-2 block font-semibold text-slate-700">Error Message</Label>
						<Textarea
							bind:value={errorMessage}
							placeholder="Enter validation error message"
							class="h-24 w-full resize-y rounded-md border-2 border-gray-200 p-3 text-sm "
						></Textarea>
					</div>

					<div class="mb-4">
						<Label class="mb-2 block font-semibold text-slate-700">Success Message (Optional)</Label
						>
						<Textarea
							bind:value={successMessage}
							placeholder="Enter validation success message"
							class="h-24 w-full resize-y rounded-md border-2 border-gray-200 p-3 text-sm "
						></Textarea>
					</div>
				</div>

				<!-- Fallback Section -->
				<div class="mt-5 rounded-md border border-yellow-300 bg-yellow-50 p-4">
					<div class="mb-2 font-semibold text-yellow-800">Fallback Rule (Optional)</div>
					<Select.Root type="single" name="FallbackAction" bind:value={fallbackAction}>
						<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm ">
							{fallbackAction}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="Allow submission with warning"
								>Allow submission with warning</Select.Item
							>
							<Select.Item value="Block submission">Block submission</Select.Item>
							<Select.Item value="Skip validation">Skip validation</Select.Item>
							<Select.Item value="Apply default value">Apply default value</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Modal Footer -->
			<div class="flex flex-shrink-0 justify-end gap-2 border-t border-gray-200 px-8 py-5">
				<Button
					type="button"
					onclick={handleCancel}
					variant="outline"
					class="rounded-md border border-gray-300 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100"
				>
					Cancel
				</Button>
				<Button
					type="button"
					onclick={handleSave}
					class="rounded-md bg-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
				>
					Save Validation Rule
				</Button>
			</div>
		</div>
	</div>
{/if}
