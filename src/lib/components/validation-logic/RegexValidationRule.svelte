<script lang="ts">
	import { functionExpressionOperationSchema, OperationType } from './schemas/function-expression-operation-schema.js';
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card/index.js';
	import { Badge } from '../ui/badge/index.js';
	import { Alert, AlertDescription } from '../ui/alert/index.js';
	import { Separator } from '../ui/separator/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';

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
		return title
			.replace(/\s+/g, '-')
			.replace(/[^\w\-?.,!@#$%^&*()]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');
	}

	// Effect to populate form when editing
	$effect(() => {
		if (!isEditing || !editingRule) return;
		const originalRule = editingRule?.originalRule;
		const op = originalRule?.Operation;
		if (!op || op.Type !== 'FunctionExpression') return;

		let vars: any = op.Variables;
		if (typeof vars === 'string') {
			try {
				vars = JSON.parse(vars);
			} catch {
				vars = {};
			}
		}

		const pat = vars?.regex?.Value || '';
		if (pat) {
			regexPattern = pat;
		}

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

	// Regex presets with examples and descriptions
	const regexPresets = [
		{
			name: 'Email',
			pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
			description: 'Validates standard email format',
			examples: ['user@example.com', 'john.doe@company.org', 'test+tag@gmail.com'],
			icon: 'lucide:mail'
		},
		{
			name: 'Phone Number',
			pattern: '^[+]?[0-9]{10,15}$',
			description: 'Validates phone numbers with optional country code',
			examples: ['1234567890', '+1234567890', '9876543210'],
			icon: 'lucide:phone'
		},
		{
			name: 'URL',
			pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
			description: 'Validates HTTP and HTTPS URLs',
			examples: ['https://example.com', 'http://www.google.com', 'https://github.com/user/repo'],
			icon: 'lucide:link'
		},
		{
			name: 'Number',
			pattern: '^[0-9]+$',
			description: 'Validates positive integers only',
			examples: ['123', '456789', '0'],
			icon: 'lucide:hash'
		},
		{
			name: 'Alphanumeric',
			pattern: '^[a-zA-Z0-9]+$',
			description: 'Validates letters and numbers only',
			examples: ['abc123', 'Test456', 'user123'],
			icon: 'lucide:type'
		},
		{
			name: 'Date (YYYY-MM-DD)',
			pattern: '^\\d{4}-\\d{2}-\\d{2}$',
			description: 'Validates ISO date format',
			examples: ['2024-01-15', '2023-12-31', '2024-02-29'],
			icon: 'lucide:calendar'
		},
		{
			name: 'Time (HH:MM)',
			pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
			description: 'Validates 24-hour time format',
			examples: ['09:30', '14:45', '23:59'],
			icon: 'lucide:clock'
		},
		{
			name: 'Postal Code (US)',
			pattern: '^\\d{5}(-\\d{4})?$',
			description: 'Validates US ZIP codes',
			examples: ['12345', '12345-6789', '98765'],
			icon: 'lucide:map-pin'
		},
		{
			name: 'Credit Card',
			pattern: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$',
			description: 'Validates credit card number format',
			examples: ['1234567890123456', '1234-5678-9012-3456', '1234 5678 9012 3456'],
			icon: 'lucide:credit-card'
		},
		{
			name: 'Custom',
			pattern: 'CUSTOM',
			description: 'Create your own custom regex pattern',
			examples: [
				'Letters only: ^[A-Za-z]+$',
				'SSN format: ^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
				'2 letters + 4 digits: ^[A-Z]{2}[0-9]{4}$'
			],
			icon: 'lucide:settings'
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

	let selectedPresetData = $derived(
		regexPresets.find(preset => preset.pattern === activeRegexPreset) || null
	);

	function selectRegexPreset(preset) {
		if (preset.name === 'Custom') {
			activeRegexPreset = 'CUSTOM';
		} else {
			activeRegexPreset = preset.pattern;
			regexPattern = preset.pattern;
		}

		if (errors.regexPattern) {
			errors.regexPattern = '';
		}

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
				} finally {
					isProcessing = false;
					shouldTriggerSave = false;
				}
			})();
		}
	});

	async function handleSave() {
		errors = {} as Record<string, string>;

		if (!isEditing) {
			if (!activeRegexPreset || activeRegexPreset === '') {
				errors.regexPattern = 'Please select a regex preset';
			} else if (regexPattern.trim()) {
				try {
					new RegExp(regexPattern);
				} catch (e) {
					errors.regexPattern = 'Invalid regex pattern';
				}
			}

			if (!selectedFieldTitle || selectedFieldTitle === 'Select a field' || selectedFieldTitle === '') {
				errors.selectedField = 'Please select a field to validate';
			}
		}

		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			const finalRuleName = ruleName || 'New Regex Rule';
			const finalRuleDescription = ruleDescription || 'New regex validation';
			const finalRegexPattern = regexPattern || '.*';

			const finalSelectedField =
				selectedField ||
				questionList?.find(
					(field) => field.Title === selectedFieldTitle || field.DisplayCode === selectedFieldTitle
				) ||
				currentField;

			const operation = {
				Name: `${finalRuleName} - Regex validation`,
				Description: `${finalRuleDescription} - Regex pattern validation`,
				Expression: JSON.stringify({
					source: finalRegexPattern,
					flags: ''
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

			const result = await functionExpressionOperationSchema.safeParseAsync(operation);
			if (!result.success) {
				console.error('Function expression operation validation failed:', result.error);
				errors.general = 'Invalid operation structure';
				return;
			}

			const operationResponse = await fetch('/api/server/operations/function-expression-operation', {
				method: 'POST',
				body: JSON.stringify(operation),
				headers: { 'content-type': 'application/json' }
			});

			if (!operationResponse.ok) {
				const errorData = await operationResponse.json();
				throw new Error(errorData.Message || 'Failed to create regex operation');
			}

			const operationData = await operationResponse.json();
			console.log('Regex operation created successfully:', operationData);

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
		errors = {} as Record<string, string>;

		if (regexPattern.trim()) {
			try {
				new RegExp(regexPattern);
			} catch (e) {
				errors.regexPattern = 'Invalid regex pattern';
			}
		}

		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			const finalRuleName = ruleName || 'Updated Regex Rule';
			const finalRuleDescription = ruleDescription || 'Updated regex validation';
			const finalRegexPattern = regexPattern || '.*';

			const finalSelectedField =
				selectedField ||
				questionList?.find(
					(field) => field.Title === selectedFieldTitle || field.DisplayCode === selectedFieldTitle
				) ||
				currentField;

			const operation = {
				Name: `${finalRuleName} - Regex validation`,
				Description: `${finalRuleDescription} - Regex pattern validation`,
				Expression: JSON.stringify({
					source: finalRegexPattern,
					flags: ''
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

			const result = await functionExpressionOperationSchema.safeParseAsync(operation);
			if (!result.success) {
				console.error('Function expression operation validation failed:', result.error);
				errors.general = 'Invalid operation structure';
				return;
			}

			const originalRule = editingRule?.originalRule;
			let operationId = null;
			let ruleId = null;

			if (originalRule) {
				operationId = originalRule.Operation.id;
				ruleId = originalRule.id || originalRule.ruleId;
			}

			if (operationId) {
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

<div class="space-y-6">
	<!-- Validation Summary Alert -->
	{#if !isEditing && (Object.keys(errors).length > 0 || !activeRegexPreset || !selectedFieldTitle)}
		<Alert variant="default" class="border-amber-200 bg-amber-50">
			<Icon icon="lucide:alert-triangle" class="h-4 w-4 text-amber-600" />
			<AlertDescription class="text-amber-800">
				<div class="font-medium mb-2">Validation Required</div>
				<ul class="space-y-1 text-sm">
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
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Field Selection Card -->
	<Card>
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
					<Icon icon="lucide:target" class="h-5 w-5" />
				</div>
				<div>
					<CardTitle class="text-lg">Field Selection</CardTitle>
					<CardDescription>Choose which field to apply regex validation to</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-3">
				<Label class="text-sm font-medium">Field to Validate</Label>
				<Select.Root type="single" bind:value={selectedFieldTitle}>
					<Select.Trigger class={`w-full ${errors.selectedField 
						? 'border-red-500' 
						: selectedFieldTitle && selectedFieldTitle !== 'Select a field' 
							? 'border-green-500' 
							: ''}`}>
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
					<p class="text-sm text-red-500 flex items-center gap-1">
						<Icon icon="lucide:x-circle" class="h-4 w-4" />
						{errors.selectedField}
					</p>
				{:else if selectedFieldTitle && selectedFieldTitle !== 'Select a field'}
					<p class="text-sm text-green-600 flex items-center gap-1">
						<Icon icon="lucide:check-circle" class="h-4 w-4" />
						Field selected: {formatFieldTitle(selectedFieldTitle)}
					</p>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Regex Presets Card -->
	<Card>
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
					<Icon icon="lucide:zap" class="h-5 w-5" />
				</div>
				<div>
					<CardTitle class="text-lg">Regex Presets</CardTitle>
					<CardDescription>Choose from common validation patterns or create a custom one</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each regexPresets as preset}
						<button
							type="button"
							class={`text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
								activeRegexPreset === preset.pattern 
									? 'border-blue-500 bg-blue-50' 
									: 'border-gray-200 hover:border-gray-300'
							}`}
							onclick={() => selectRegexPreset(preset)}
						>
							<div class="flex items-center gap-3 mb-2">
								<div class={`flex h-8 w-8 items-center justify-center rounded-lg ${
									activeRegexPreset === preset.pattern 
										? 'bg-blue-100 text-blue-600' 
										: 'bg-gray-100 text-gray-600'
								}`}>
									<Icon icon={preset.icon} class="h-4 w-4" />
								</div>
								<div>
									<div class="font-medium text-sm">{preset.name}</div>
									{#if activeRegexPreset === preset.pattern}
										<Badge variant="secondary" class="text-xs mt-1">Selected</Badge>
									{/if}
								</div>
							</div>
							<p class="text-xs text-gray-600 leading-relaxed">{preset.description}</p>
						</button>
					{/each}
				</div>

				{#if !activeRegexPreset}
					<p class="text-sm text-amber-600 flex items-center gap-1">
						<Icon icon="lucide:alert-triangle" class="h-4 w-4" />
						Please select a regex preset
					</p>
				{:else}
					<p class="text-sm text-green-600 flex items-center gap-1">
						<Icon icon="lucide:check-circle" class="h-4 w-4" />
						Regex preset selected
					</p>
				{/if}

				{#if selectedPresetData && isEditing}
					<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<div class="flex items-center gap-2 mb-3">
							<Icon icon="lucide:lightbulb" class="h-4 w-4 text-blue-600" />
							<span class="font-medium text-blue-800 text-sm">
								{activeRegexPreset === 'CUSTOM' ? 'Regex Pattern Examples:' : 'Valid Examples:'}
							</span>
						</div>
						<ul class="space-y-1">
							{#each currentExamples as example}
								<li class="text-xs text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
									{example}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Custom Pattern Card -->
	<Card>
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
					<Icon icon="lucide:code" class="h-5 w-5" />
				</div>
				<div>
					<CardTitle class="text-lg">Custom Regex Pattern</CardTitle>
					<CardDescription>Define your own validation pattern</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Pattern</Label>
					<Input
						type="text"
						bind:value={regexPattern}
						placeholder="Enter your custom regex pattern (e.g., ^[A-Za-z]+$ for letters only)"
						class={`font-mono ${errors.regexPattern ? 'border-red-500' : regexPattern.trim() ? 'border-green-500' : ''}`}
					/>
					{#if errors.regexPattern}
						<p class="text-sm text-red-500 flex items-center gap-1">
							<Icon icon="lucide:x-circle" class="h-4 w-4" />
							{errors.regexPattern}
						</p>
					{:else if regexPattern.trim()}
						<p class="text-sm text-green-600 flex items-center gap-1">
							<Icon icon="lucide:check-circle" class="h-4 w-4" />
							Valid regex pattern
						</p>
					{/if}
				</div>

				<Separator />

				<!-- Test Section -->
				<div class="space-y-3">
					<Label class="text-sm font-medium flex items-center gap-2">
						<Icon icon="lucide:flask" class="h-4 w-4" />
						Test Your Pattern
					</Label>
					<div class="flex gap-2">
						<Input 
							type="text" 
							bind:value={testInput} 
							placeholder="Enter test value" 
							class="flex-1" 
						/>
						<Button type="button" variant="outline" onclick={testRegex}>
							<Icon icon="lucide:play" class="h-4 w-4 mr-2" />
							Test
						</Button>
					</div>
					{#if testResult}
						<div class={`flex items-center gap-2 p-3 rounded-lg text-sm ${
							testResultClass === 'success' 
								? 'bg-green-50 text-green-800 border border-green-200' 
								: 'bg-red-50 text-red-800 border border-red-200'
						}`}>
							<Icon icon={testResultClass === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'} class="h-4 w-4" />
							{testResult}
						</div>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Error Display -->
	{#if errors.general}
		<Alert variant="destructive">
			<Icon icon="lucide:alert-circle" class="h-4 w-4" />
			<AlertDescription>{errors.general}</AlertDescription>
		</Alert>
	{/if}
</div>