<script lang="ts">
	import {
		functionExpressionOperationSchema,
		OperationType
	} from './function-expression-operation-schema.js';
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import { toastMessage } from '../toast/toast.store.js';

	////////////////////////////////////////////////////////////////////////////////////////////////
	// Props
	let {
		isEditing = false,
		editingRule = null,
		currentField,
		questionList,
		ruleName = '',
		ruleDescription = '',
		activeRegexPreset = '',
		regexPattern = '',
		handleRegexOperationCreated,
		shouldTriggerSave = $bindable(false)
	} = $props();

	// State
	let errors = $state({} as Record<string, string>);
	let testInput = $state('user@example.com');
	let testResult = $state('✓ Pattern matches the test input');
	let testResultClass = $state('success');
	let isProcessing = $state(false);

	// Regex presets
	const regexPresets = [
		{ name: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
		{ name: 'Phone Number', pattern: '^[+]?[0-9]{10,15}$' },
		{
			name: 'URL',
			pattern:
				'^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
		},
		{ name: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
		{ name: 'Time (HH:MM)', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
		{ name: 'Postal Code (US)', pattern: '^\\d{5}(-\\d{4})?$' },
		{ name: 'Credit Card', pattern: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$' },
		{ name: 'Custom', pattern: '' }
	];

	function selectRegexPreset(preset) {
		activeRegexPreset = preset.name === 'Custom' ? '' : preset.pattern;
		regexPattern = preset.name === 'Custom' ? regexPattern : preset.pattern;
	}
	function testRegex() {
		if (!regexPattern.trim()) return;
		try {
			const regex = new RegExp(regexPattern);
			const isValid = regex.test(testInput);
			testResult = isValid ? '✓ Pattern matches!' : '✗ Pattern does not match.';
			testResultClass = isValid ? 'success' : 'error';
		} catch (e) {
			testResult = '✗ Invalid regex pattern';
			testResultClass = 'error';
		}
	}

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

	async function handleSave() {
		console.log('handleSave called with selectedField:', currentField);
		console.log('handleSave - selectedField type:', typeof currentField);
		console.log('handleSave - selectedField.id:', currentField?.id);
		console.log('handleSave - selectedField.DisplayCode:', currentField?.DisplayCode);
		// Reset errors
		errors = {} as Record<string, string>;

		// Validate required fields (only when not editing)
		// if (!isEditing) {
		// 	if (!activeRegexPreset && !regexPattern.trim()) {
		// 		errors.regexPattern = 'Please select a regex preset or enter a custom pattern';
		// 	} else if (regexPattern.trim()) {
		// 		try {
		// 			new RegExp(regexPattern);
		// 		} catch (e) {
		// 			errors.regexPattern = 'Invalid regex pattern';
		// 		}
		// 	}

		// 	if (!currentField || typeof currentField === 'string') {
		// 		errors.selectedField = 'Please select a field to validate';
		// 	}
		// } else {
		// 	// When editing, only validate regex pattern if it's provided
		// 	if (regexPattern.trim()) {
		// 		try {
		// 			new RegExp(regexPattern);
		// 		} catch (e) {
		// 			errors.regexPattern = 'Invalid regex pattern';
		// 		}
		// 	}
		// }

		// // If there are validation errors, don't proceed
		// if (Object.keys(errors).length > 0) {
		// 	console.log('Validation errors:', errors);
		// 	return;
		// }

		try {
			const finalRegexPattern = activeRegexPreset || regexPattern;

			// Step 1: Create the function expression operation
			const regexOperation = {
				Name: `${ruleName} - Regex validation`,
				Description: `${ruleDescription} - Regex pattern validation`,
				Type: OperationType.FunctionExpression,
				Expression: finalRegexPattern,
				Variables: JSON.stringify({
					regex: {
						Type: 'Constant',
						DataType: 'Text',
						FieldId: currentField?.id
					}
				})
			};

			// Validate the regex operation
			const result = await functionExpressionOperationSchema.safeParseAsync(regexOperation);
			if (!result.success) {
				console.error('Regex operation validation failed:', result.error);
				errors.general = 'Invalid regex operation structure';
				return;
			}

			// Create operation
			const operationResponse = await fetch(
				'/api/server/operations/function-expression-operation',
				{
					method: 'POST',
					body: JSON.stringify(regexOperation),
					headers: { 'content-type': 'application/json' }
				}
			);

			if (!operationResponse.ok) {
				const errorData = await operationResponse.json();
				toastMessage(errorData);
				throw new Error(errorData.Message || 'Failed to create regex operation');
			}

			const operationData = await operationResponse.json();

			console.log('Regex operation created successfully:', operationData);

			// Dispatch the complete workflow data to parent
			handleRegexOperationCreated({
				detail: {
					operationId: operationData.Data.id,
					operationType: OperationType.FunctionExpression,
					operation: regexOperation
				}
			});
		} catch (error) {
			console.error('Error creating regex validation workflow:', error);
			errors.general = error.message;
		}
	}

	async function handleEdit() {
		// Reset errors
		errors = {} as Record<string, string>;

		// When editing, all fields are optional - only validate regex pattern if provided
		if (regexPattern.trim()) {
			try {
				new RegExp(regexPattern);
			} catch (e) {
				errors.regexPattern = 'Invalid regex pattern';
			}
		}

		if (Object.keys(errors).length > 0) {
			console.log('Validation errors:', errors);
			return;
		}

		try {
			// When editing, use props for rule name and description
			const finalRuleName = ruleName || 'Updated Regex Rule';
			const finalRuleDescription = ruleDescription || 'Updated regex validation';
			const finalRegexPattern = regexPattern || '.*';
			const finalSelectedField = currentField;

			// Step 1: Update the function expression operation
			const operation = {
				Name: `${finalRuleName} - Regex validation`,
				Description: `${finalRuleDescription} - Regex pattern validation`,
				Expression: 'regex.test(input)',
				Variables: JSON.stringify({
					regex: {
						Type: 'Constant',
						DataType: 'Text',
						Value: finalRegexPattern
					},
					input: {
						Type: 'FieldReference',
						DataType: finalSelectedField?.ResponseType || 'Text',
						FieldId: finalSelectedField?.id || '',
						FieldCode: finalSelectedField?.DisplayCode || ''
					}
				})
			};

			// Validate the operation
			const result = await functionExpressionOperationSchema.safeParseAsync(operation);
			if (!result.success) {
				console.error('Function expression operation validation failed:', result.error);
				errors.general = 'Invalid operation structure';
				return;
			}

			// Get the original rule data to extract operation ID
			const originalRule = editingRule?.originalRule;
			let operationId = null;
			let ruleId = null;
			let validationRule = null;

			// Try to extract operation ID and rule ID from the rule
			if (originalRule) {
				operationId = originalRule.OperationId;
				ruleId = originalRule.id || originalRule.ruleId;
			}

			if (operationId) {
				// Step 1: Update the existing operation
				const operationEndpoint = `/api/server/operations/function-expression-operation/${operationId}`;

				const operationResponse = await fetch(operationEndpoint, {
					method: 'PUT',
					body: JSON.stringify(operation),
					headers: { 'content-type': 'application/json' }
				});

				if (!operationResponse.ok) {
					const errorData = await operationResponse.json();
					toastMessage(errorData);
					throw new Error(errorData.Message || 'Failed to update regex operation');
				}

				const operationData = await operationResponse.json();
				toastMessage(operationData);
				console.log('Regex operation updated successfully:', operationData);
			} else {
				console.log('No operation ID found for editing');
				errors.general = 'No operation ID found for editing';
			}
		} catch (error) {
			console.error('Error updating regex validation workflow:', error);
			errors.general = error.message;
		}
	}
</script>

<!-- Regex Validation UI -->
<div class="mb-5 rounded-md border-2 border-gray-200 bg-white p-5">
	<h3 class="mb-4 font-medium text-slate-700">Regular Expression Validation</h3>

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
						<Select.Item value={f.Title || f.DisplayCode}>{f.Title || f.DisplayCode}</Select.Item>
					{/each}
				{/each}
			</Select.Content>
		</Select.Root>
		{#if errors.selectedField}
			<p class="mt-1 text-sm text-red-500">{errors.selectedField}</p>
		{/if}
	</div>

	<!-- Regex Presets -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Regex Presets</Label>
		<div class="grid grid-cols-2 gap-2">
			{#each regexPresets as preset}
				<Button
					type="button"
					variant={activeRegexPreset === preset.pattern ? 'default' : 'outline'}
					class="justify-start"
					onclick={() => selectRegexPreset(preset)}
				>
					{preset.name}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Custom Regex Pattern -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Custom Regex Pattern</Label>
		<Input type="text" bind:value={regexPattern} placeholder="Enter custom regex pattern" />
		{#if errors.regexPattern}
			<p class="mt-1 text-sm text-red-500">{errors.regexPattern}</p>
		{/if}
	</div>

	<!-- Test Regex -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Test Pattern</Label>
		<div class="flex gap-2">
			<Input type="text" bind:value={testInput} placeholder="Enter test value" class="flex-1" />
			<Button type="button" variant="outline" onclick={testRegex}>Test</Button>
		</div>
		{#if testResult}
			<p class="mt-2 text-sm {testResultClass === 'success' ? 'text-green-600' : 'text-red-600'}">
				{testResult}
			</p>
		{/if}
	</div>

	<!-- Error Display -->
	{#if errors.general}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
			<p class="text-sm text-red-600">{errors.general}</p>
		</div>
	{/if}
</div>
