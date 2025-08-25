<script lang="ts">
	import { functionExpressionOperationSchema, OperationType } from './schemas/function-expression-operation-schema.js';
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
		selectedField = null,
		handleRegexOperationCreated,
		shouldTriggerSave = $bindable(false)
	} = $props();

	// State
	let errors = $state({} as Record<string, string>);
	let testInput = $state('user@example.com');
	let testResult = $state('✓ Pattern matches the test input');
	let testResultClass = $state('success');
	let isProcessing = $state(false);
	let selectedFieldTitle = $state(
		(selectedField || currentField)?.Title || (selectedField || currentField)?.DisplayCode || ''
	);

	// Helper function to format field title with hyphens
	function formatFieldTitle(title: string): string {
		if (!title) return '';
		// Replace spaces and special characters with hyphens, but keep question marks and other punctuation
		return title
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/[^\w\-?.,!@#$%^&*()]/g, '-') // Replace special chars except punctuation with hyphens
			.replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
			.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
	}

	// Effect to populate form when editing
	$effect(() => {
		if (!isEditing || !editingRule) return;
		const originalRule = editingRule?.originalRule;
		const op = originalRule?.Operation;
		if (!op || op.Type !== 'FunctionExpression') return;

		// Variables may be stringified JSON or an object
		let vars: any = op.Variables;
		if (typeof vars === 'string') {
			try {
				vars = JSON.parse(vars);
			} catch {
				vars = {};
			}
		}

		// Populate regex pattern
		const pat = vars?.regex?.Value || '';
		if (pat) {
			regexPattern = pat;
		}

		// Populate selected field title from input variable
		const inputVar = vars?.input || {};
		const inputFieldId = inputVar.FieldId;
		const inputFieldCode = inputVar.FieldCode;
		if (inputFieldId || inputFieldCode) {
			outer: for (const section of questionList || []) {
				for (const f of section.FormFields || []) {
					if (f.id === inputFieldId || f.DisplayCode === inputFieldCode) {
						selectedFieldTitle = f.Title || f.DisplayCode || '';
						break outer;
					}
				}
			}
		} else if (selectedField) {
			selectedFieldTitle = selectedField.Title || selectedField.DisplayCode || '';
		}
	});

	// Effect to automatically select preset when regexPattern changes (for editing)
	$effect(() => {
		if (!isEditing || !regexPattern) return;
		const matchingPreset = regexPresets.find((preset) => preset.pattern === regexPattern);
		activeRegexPreset = matchingPreset ? matchingPreset.pattern : 'CUSTOM';
		testRegex();
	});

	// Effect to clear validation errors when regex pattern changes
	$effect(() => {
		if (regexPattern.trim() && errors.regexPattern) {
			errors.regexPattern = '';
		}
	});

	// Regex presets with examples
	const regexPresets = [
		{
			name: 'Email',
			pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
			examples: ['user@example.com', 'john.doe@company.org', 'test+tag@gmail.com']
		},
		{
			name: 'Phone Number',
			pattern: '^[+]?[0-9]{10,15}$',
			examples: ['1234567890', '+1234567890', '9876543210']
		},
		{
			name: 'URL',
			pattern:
				'^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
			examples: ['https://example.com', 'http://www.google.com', 'https://github.com/user/repo']
		},
		{
			name: 'Number',
			pattern: '^[0-9]+$',
			examples: ['123', '456789', '0']
		},
		{
			name: 'Alphanumeric',
			pattern: '^[a-zA-Z0-9]+$',
			examples: ['abc123', 'Test456', 'user123']
		},
		{
			name: 'Date (YYYY-MM-DD)',
			pattern: '^\\d{4}-\\d{2}-\\d{2}$',
			examples: ['2024-01-15', '2023-12-31', '2024-02-29']
		},
		{
			name: 'Time (HH:MM)',
			pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
			examples: ['09:30', '14:45', '23:59']
		},
		{
			name: 'Postal Code (US)',
			pattern: '^\\d{5}(-\\d{4})?$',
			examples: ['12345', '12345-6789', '98765']
		},
		{
			name: 'Credit Card',
			pattern: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$',
			examples: ['1234567890123456', '1234-5678-9012-3456', '1234 5678 9012 3456']
		},
		{
			name: 'Custom',
			pattern: 'CUSTOM',
			examples: [
				'Letters only: ^[A-Za-z]+$',
				'SSN format: ^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
				'2 letters + 4 digits: ^[A-Z]{2}[0-9]{4}$',
				'Email: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
				'Phone: ^[+]?[0-9]{10,15}$'
			]
		}
	];

	// Get current examples based on selected preset
	let currentExamples = $derived(
		!activeRegexPreset
			? []
			: (() => {
					const selectedPreset = regexPresets.find(
						(preset) => preset.pattern === activeRegexPreset
					);
					return selectedPreset?.examples || [];
				})()
	);

	function selectRegexPreset(preset) {
		if (preset.name === 'Custom') {
			activeRegexPreset = 'CUSTOM';
		} else {
			activeRegexPreset = preset.pattern;
			regexPattern = preset.pattern;
		}

		// Clear validation errors when a preset is selected
		if (errors.regexPattern) {
			errors.regexPattern = '';
		}

		// Test the pattern to show the result
		testRegex();
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
		// Reset errors
		errors = {} as Record<string, string>;

		// Validate required fields (only when not editing)
		if (!isEditing) {
			// Check if a regex preset is selected (including Custom)
			if (!activeRegexPreset || activeRegexPreset === '') {
				errors.regexPattern = 'Please select a regex preset';
			} else if (regexPattern.trim()) {
				// Validate the regex pattern
				try {
					new RegExp(regexPattern);
				} catch (e) {
					errors.regexPattern = 'Invalid regex pattern';
				}
			}

			// Check if a field is selected
			if (
				!selectedFieldTitle ||
				selectedFieldTitle === 'Select a field' ||
				selectedFieldTitle === ''
			) {
				errors.selectedField = 'Please select a field to validate';
			}
		}

		// If there are validation errors, don't proceed
		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			// When editing, use props for rule name and description
			const finalRuleName = ruleName || 'New Regex Rule';
			const finalRuleDescription = ruleDescription || 'New regex validation';
			const finalRegexPattern = regexPattern || '.*';

			// Find the selected field based on selectedFieldTitle
			const finalSelectedField =
				selectedField ||
				questionList?.find(
					(field) => field.Title === selectedFieldTitle || field.DisplayCode === selectedFieldTitle
				) ||
				currentField;

			// Step 1: Create the function expression operation
			const operation = {
				Name: `${finalRuleName} - Regex validation`,
				Description: `${finalRuleDescription} - Regex pattern validation`,
				// Instead of raw string, stringify a JSON object
				Expression: JSON.stringify({
					source: finalRegexPattern,
					flags: '' // add 'i', 'g' if you want later
				}),
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

			// Create operation
			const operationResponse = await fetch(
				'/api/server/operations/function-expression-operation',
				{
					method: 'POST',
					body: JSON.stringify(operation),
					headers: { 'content-type': 'application/json' }
				}
			);

			if (!operationResponse.ok) {
				const errorData = await operationResponse.json();
				throw new Error(errorData.Message || 'Failed to create regex operation');
			}

			const operationData = await operationResponse.json();
			console.log('Regex operation created successfully:', operationData);

			// Dispatch the complete workflow data to parent
			handleRegexOperationCreated({
				detail: {
					operationId: operationData.Data.id,
					operationType: OperationType.FunctionExpression,
					operation: operation
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

		// When editing, all fields are optional - only validate regex pattern if it's provided
		if (regexPattern.trim()) {
			try {
				new RegExp(regexPattern);
			} catch (e) {
				errors.regexPattern = 'Invalid regex pattern';
			}
		}

		// If there are validation errors, don't proceed
		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			// When editing, use props for rule name and description
			const finalRuleName = ruleName || 'Updated Regex Rule';
			const finalRuleDescription = ruleDescription || 'Updated regex validation';
			const finalRegexPattern = regexPattern || '.*';

			// Find the selected field based on selectedFieldTitle
			const finalSelectedField =
				selectedField ||
				questionList?.find(
					(field) => field.Title === selectedFieldTitle || field.DisplayCode === selectedFieldTitle
				) ||
				currentField;

			// Step 1: Update the function expression operation
			const operation = {
				Name: `${finalRuleName} - Regex validation`,
				Description: `${finalRuleDescription} - Regex pattern validation`,
				// Instead of raw string, stringify a JSON object
				Expression: JSON.stringify({
					source: finalRegexPattern,
					flags: '' // add 'i', 'g' if you want later
				}),
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
				operationId = originalRule.Operation.id;
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
					throw new Error(errorData.Message || 'Failed to update regex operation');
				}

				const operationData = await operationResponse.json();
				console.log('Regex operation updated successfully:', operationData);

				// Dispatch success event to parent to close modal
				handleRegexOperationCreated({
					detail: {
						operationId: operationId,
						operationType: OperationType.FunctionExpression,
						operation: operation,
						isEdit: true
					}
				});
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
<div class="space-y-4">
	<!-- Validation Summary -->
	{#if !isEditing && (Object.keys(errors).length > 0 || !activeRegexPreset || !selectedFieldTitle)}
		<div class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
			<h4 class="mb-2 font-medium text-amber-800">⚠️ Validation Required</h4>
			<ul class="space-y-1 text-sm text-amber-700">
				{#if !activeRegexPreset}
					<li>• Please select a regex preset</li>
				{/if}
				{#if !selectedFieldTitle || selectedFieldTitle === 'Select a field'}
					<li>• Please select a field to validate</li>
				{/if}
				{#if errors.regexPattern}
					<li>• {errors.regexPattern}</li>
				{/if}
				{#if errors.selectedField}
					<li>• {errors.selectedField}</li>
				{/if}
			</ul>
		</div>
	{/if}

	<!-- Field Selection -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Field to Validate</Label>
		<Select.Root type="single" bind:value={selectedFieldTitle}>
			<Select.Trigger
				class="w-full {errors.selectedField
					? 'border-red-500'
					: selectedFieldTitle && selectedFieldTitle !== 'Select a field'
						? 'border-green-500'
						: ''}"
			>
				{selectedFieldTitle ? formatFieldTitle(selectedFieldTitle) : 'Select a field'}
			</Select.Trigger>
			<Select.Content portalProps={{}}>
				{#each questionList as field}
					{#each field.FormFields as f}
						<Select.Item value={f.Title || f.DisplayCode}>
							{formatFieldTitle(f.Title || f.DisplayCode)}
						</Select.Item>
					{/each}
				{/each}
			</Select.Content>
		</Select.Root>
		{#if errors.selectedField}
			<p class="mt-1 text-sm text-red-500">{errors.selectedField}</p>
		{:else if selectedFieldTitle && selectedFieldTitle !== 'Select a field'}
			<p class="mt-1 text-sm text-green-600">
				✓ Field selected: {formatFieldTitle(selectedFieldTitle)}
			</p>
		{:else}
			<p class="mt-1 text-sm text-amber-600">⚠️ Please select a field to validate</p>
		{/if}
	</div>

	<!-- Regex Presets -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Regex Presets</Label>
		<div class="flex flex-wrap gap-2">
			{#each regexPresets as preset}
				<Button
					type="button"
					variant={activeRegexPreset === preset.pattern ? 'default' : 'outline'}
					class="justify-start {activeRegexPreset === preset.pattern ? 'bg-primary' : ''}"
					onclick={() => selectRegexPreset(preset)}
				>
					{preset.name}
				</Button>
			{/each}
		</div>
		{#if !activeRegexPreset}
			<p class="mt-1 text-sm text-amber-600">⚠️ Please select a regex preset</p>
		{:else}
			<p class="mt-1 text-sm text-green-600">✓ Regex preset selected</p>
		{/if}

		<!-- Examples for editing -->
		{#if isEditing}
			<div class="mt-2 rounded border border-blue-200 bg-blue-50 p-3 text-xs">
				<p class="mb-1 font-medium text-blue-800">
					💡 {activeRegexPreset === 'CUSTOM' ? 'Regex Pattern Examples:' : 'Valid Examples:'}
				</p>
				<ul class="space-y-1 text-blue-700">
					{#each currentExamples as example}
						<li>• {example}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<!-- Custom Regex Pattern -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Custom Regex Pattern</Label>
		<Input
			type="text"
			bind:value={regexPattern}
			placeholder="Enter your custom regex pattern (e.g., ^[A-Za-z]+$ for letters only)"
			class={errors.regexPattern ? 'border-red-500' : regexPattern.trim() ? 'border-green-500' : ''}
		/>
		{#if errors.regexPattern}
			<p class="mt-1 text-sm text-red-500">{errors.regexPattern}</p>
		{:else if regexPattern.trim()}
			<p class="mt-1 text-sm text-green-600">✓ Valid regex pattern</p>
		{/if}
	</div>

	<!-- Test Regex -->
	<div class="mb-4">
		<Label class="mb-2 block text-sm font-medium text-gray-700">Test Pattern</Label>
		<div class="flex gap-2">
			<Input type="text" bind:value={testInput} placeholder="Enter test value" class="flex-1" />
			<Button type="button" variant="default" onclick={testRegex}>Test</Button>
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
