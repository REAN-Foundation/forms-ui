<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { Textarea } from '../ui/textarea/index.js';
	import RegexValidation from './RegexValidationRule.svelte';
	import LogicalValidation from './LogicalValidationRule.svelte';
	import CompositeValidation from './CompositeValidationRule.svelte';
	import { invalidateAll } from '$app/navigation';
	import { toastMessage } from '../toast/toast.store.js';

	///////////////////////////////////////////////////////////////////////////////////////////////

	// Props
	let {
		isOpen = $bindable(false),
		onSave,
		onCancel,
		editingRule = null,
		currentField,
		questionList
	} = $props();

	// Derived state
	let isEditing = $derived(!!editingRule);
	let shouldTriggerSave = $state(false);

	// Function to reset trigger flag
	function resetTriggerFlag() {
		shouldTriggerSave = false;
	}

	let logicId = $state(currentField?.ValidateLogic?.id || '');
	let ruleId = $state(null);
	// Validation errors state
	let errors = $state({} as Record<string, any>);

	// State for form data
	let ruleName = $state(currentField?.ValidateLogic?.Title || '');
	let ruleDescription = $state('');
	let rulePriority = $state(1);
	let activeTab = $state('regex');
	let selectedField = $state(null);
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
		{ field: 'Select Field', operator: '', value: '', connector: '' }
		// { field: 'Select Field', operator: 'Greater Than', value: '10', connector: 'AND' }
	]);

	// Composite validation conditions
	let compositeConditions = $state([
		{
			field: '',
			operator: '',
			value: '',
			connector: ''
		}
	]);

	// Composite validation state
	let compositeOperator = $state('');

	// Effect to populate form fields when editing a rule
	$effect(() => {
		if (editingRule) {
			console.log('Populating form with editing rule:', editingRule);
			console.log('Original rule data:', editingRule.originalRule);

			// Populate basic rule information
			ruleName = editingRule.ruleName || '';
			ruleDescription = editingRule.description || '';
			rulePriority = editingRule.priority || 1;
			errorMessage = editingRule.errorMessage || '';
			messageSeverity = editingRule.messageSeverity || 'error';
			successMessage = editingRule.successMessage || '';
			fallbackAction = editingRule.fallbackAction || '';

			// Set the active tab based on the rule type
			activeTab = editingRule.activeTab || 'logical';

			// Populate based on rule type
			if (editingRule.activeTab === 'regex') {
				// Handle regex rule
				regexPattern =
					editingRule.regexPattern || '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
				// Find the selected field object from questionList
				if (editingRule.selectedField && questionList) {
					// Handle different types of selectedField data
					if (typeof editingRule.selectedField === 'string') {
						// If selectedField is a string (like "Email" or "Q1"), try to find by title or display code
						selectedField =
							questionList.find(
								(field) =>
									field.Title === editingRule.selectedField ||
									field.DisplayCode === editingRule.selectedField ||
									field.id === editingRule.selectedField
							) || null;
					} else if (editingRule.selectedField.id || editingRule.selectedField.DisplayCode) {
						// If selectedField is an object with id or DisplayCode
						selectedField =
							questionList.find(
								(field) =>
									field.id === editingRule.selectedField.id ||
									field.DisplayCode === editingRule.selectedField.DisplayCode
							) || null;
					} else {
						selectedField = null;
					}
				} else {
					selectedField = null;
				}

				// Determine which regex preset is active
				const patterns = {
					email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
					phone: '^\\+?1?[-\\.\\s]?\\(?[0-9]{3}\\)?[-\\.\\s]?[0-9]{3}[-\\.\\s]?[0-9]{4}$',
					url: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
					number: '^[0-9]+$',
					alphanumeric: '^[a-zA-Z0-9]+$'
				};

				for (const [preset, pattern] of Object.entries(patterns)) {
					if (pattern === regexPattern) {
						activeRegexPreset = preset;
						break;
					}
				}
				if (!patterns[activeRegexPreset]) {
					activeRegexPreset = 'custom';
				}
			} else if (editingRule.activeTab === 'logical') {
				// Handle logical rule
				if (editingRule.conditions && editingRule.conditions.length > 0) {
					conditions = editingRule.conditions.map((condition) => ({
						field: condition.field || '',
						operator: condition.operator || '',
						value: condition.value || '',
						connector: condition.connector || ''
					}));
				}
			} else if (editingRule.activeTab === 'composite') {
				// Handle composite rule
				if (editingRule.compositeConditions && editingRule.compositeConditions.length > 0) {
					compositeConditions = editingRule.compositeConditions.map((condition) => ({
						field: condition.field || '',
						operator: condition.operator || '',
						value: condition.value || '',
						connector: condition.connector || ''
					}));
				}
				compositeOperator = editingRule.compositeOperator || '';
			}
		} else {
			// Reset form when not editing
			ruleName = '';
			ruleDescription = '';
			rulePriority = 1;
			activeTab = 'regex';
			selectedField = null;
			activeRegexPreset = 'email';
			regexPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
			errorMessage = 'Please enter a valid email address and ensure you are at least 18 years old.';
			messageSeverity = 'error';
			successMessage = 'All validation checks passed successfully!';
			fallbackAction = 'Allow submission with warning';
			conditions = [
				{ field: '', operator: '', value: '', connector: '' }
				// { field: 'Select Field', operator: 'Greater Than', value: '10', connector: 'AND' }
			];
			compositeConditions = [
				{
					field: '',
					operator: '',
					value: '',
					connector: ''
				}
			];
			compositeOperator = '';
		}
	});

	function showTab(tabName: string) {
		activeTab = tabName;
	}

	function setSeverity(severity: string) {
		messageSeverity = severity;
	}

	function handleCancel() {
		isOpen = false;
		onCancel?.();
	}

	// Handler functions for child component callbacks
	function handleRegexOperationCreated(event: CustomEvent) {
		console.log('Regex operation created:', event.detail);
		resetTriggerFlag();
		// Call parent's onSave with the operation data
		handleSubmit(event.detail);
	}

	function handleLogicalOperationsCreated(event: CustomEvent) {
		console.log('Logical operations created:', event.detail);
		resetTriggerFlag();
		// Call parent's onSave with the operation data
		handleSubmit(event.detail);
	}

	function handleCompositeCompositionCreated(event: CustomEvent) {
		console.log('Composite composition created:', event.detail);
		resetTriggerFlag();
		// Call parent's onSave with the operation data
		handleSubmit(event.detail);
	}

	async function handleSubmit(operationData: any) {
		try {
			// Reset errors
			errors = {};

			// Validate required fields
			if (!ruleName.trim()) {
				errors.ruleName = 'Rule name is required';
			}

			// If there are validation errors, don't proceed
			if (Object.keys(errors).length > 0) {
				console.log('Validation errors:', errors);
				return;
			}

			if (!logicId) {
				// Step 1: Create new validation logic if it doesn't exist
				try {
					// Create new validation logic
					const logicData = {
						FieldId: currentField?.id,
						Enabled: true
					};

					const logicResponse = await fetch('/api/server/logic/validation-logic', {
						method: 'POST',
						body: JSON.stringify(logicData),
						headers: { 'content-type': 'application/json' }
					});

					if (!logicResponse.ok) {
						const errorData = await logicResponse.json();
						toastMessage(errorData);
						// throw new Error(errorData.Message || 'Failed to create validation logic');
					}

					const logicResult = await logicResponse.json();
					logicId = logicResult.Data.id;
					console.log('Validation logic created successfully:', logicResult);
				} catch (error) {
					console.error('Error creating validation logic:', error);
					errors.general = error.message;
				}
			}

			// Step 2: Create validation rule

			if (operationData) {
				// This is a replacement, so we need to create a new rule
				const ruleData = {
					Name: ruleName,
					Description: ruleDescription,
					Priority: rulePriority,
					IsActive: true,
					OperationType: operationData.operationType,
					OperationId: operationData.operationId,
					ErrorWhenFalse: true,
					ErrorMessage: errorMessage,
					LogicId: logicId
				};

				const ruleResponse = await fetch('/api/server/rules/validation-rule', {
					method: 'POST',
					body: JSON.stringify(ruleData),
					headers: { 'content-type': 'application/json' }
				});

				const ruleResult = await ruleResponse.json();
				toastMessage(ruleResult);
				ruleId = ruleResult.Data.id;
				console.log('Validation rule created successfully:', ruleResult);
				if (!ruleResponse.ok) {
					const errorData = await ruleResponse.json();
					toastMessage(errorData);
					throw new Error(errorData.Message || 'Failed to create validation rule');
				}
			}

			// Step 3: Update form field with validation logic ID (only if we created a new logic)
			if (logicId && ruleId) {
				const fieldUpdateData = {
					id: currentField?.id,
					ValidateLogicId: logicId
				};

				const fieldResponse = await fetch(`/api/server/form-fields`, {
					method: 'PUT',
					body: JSON.stringify(fieldUpdateData),
					headers: { 'content-type': 'application/json' }
				});

				if (!fieldResponse.ok) {
					const errorData = await fieldResponse.json();
					toastMessage(errorData);
					// throw new Error(errorData.Message || 'Failed to update form field with validation logic');
				} else {
					const fieldResponseData = await fieldResponse.json();
					toastMessage(fieldResponseData);
					console.log('Form field updated with validation logic');
				}
			}

			// Show success toast message
			// const fieldResponseData = await fieldResponse.json();
			// toastMessage(fieldResponseData);

			onSave?.();
			invalidateAll();
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			errors.general = error.message;
		}
	}
</script>

{#if isOpen}
	<!-- Modal Overlay -->
	<div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
		<!-- Modal -->
		<div class="flex max-h-[90vh] w-[90%] max-w-4xl flex-col rounded-lg bg-white shadow-2xl">
			<!-- Modal Header -->
			<div
				class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-8 py-5"
			>
				<h2 class="text-xl font-semibold text-slate-700">
					{editingRule ? 'Edit Validation Rule' : 'Create Validation Rule'}
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
				{#if errors.ruleName || errors.errorMessage}
					<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
						{#if errors.ruleName}
							<p class="text-sm text-red-600">• {errors.ruleName}</p>
						{/if}
						{#if errors.errorMessage}
							<p class="text-sm text-red-600">• {errors.errorMessage}</p>
						{/if}
					</div>
				{/if}

				<!-- Rule Name -->
				<div class="mb-4">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Name</Label>
					<Input
						bind:value={ruleName}
						placeholder="Enter validation rule name"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
				</div>

				<!-- Rule Description -->
				<div class="mb-4">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Description (Optional)</Label>
					<Textarea
						bind:value={ruleDescription}
						placeholder="Enter validation rule description"
						class="h-20 w-full resize-y rounded-md border-2 border-gray-200 p-3 text-sm"
					></Textarea>
				</div>

				<!-- Rule Priority -->
				<div class="mb-4">
					<Label class="mb-2 block font-semibold text-slate-700">Priority</Label>
					<Input
						type="number"
						bind:value={rulePriority}
						min="1"
						max="10"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
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

				<!-- Tab Content -->
				{#if activeTab === 'regex'}
					<RegexValidation
						{isEditing}
						{editingRule}
						{currentField}
						{questionList}
						{ruleName}
						{ruleDescription}
						{activeRegexPreset}
						{regexPattern}
						bind:shouldTriggerSave
						{handleRegexOperationCreated}
					/>
				{:else if activeTab === 'logical'}
					<LogicalValidation
						{isEditing}
						{editingRule}
						{currentField}
						{questionList}
						{ruleName}
						{ruleDescription}
						{conditions}
						bind:shouldTriggerSave
						{handleLogicalOperationsCreated}
					/>
				{:else if activeTab === 'composite'}
					<CompositeValidation
						{isEditing}
						{editingRule}
						{currentField}
						{questionList}
						{ruleName}
						{ruleDescription}
						{compositeConditions}
						{compositeOperator}
						bind:shouldTriggerSave
						{handleCompositeCompositionCreated}
					/>
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
					onclick={() => {
						// Validate common fields first
						if (!ruleName.trim()) {
							errors.ruleName = 'Rule name is required';
							return;
						}
						if (!errorMessage.trim()) {
							errors.errorMessage = 'Error message is required';
							return;
						}
						// If validation passes, trigger the child component save/edit
						shouldTriggerSave = true;
					}}
					class="rounded-md bg-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
				>
					{editingRule ? 'Save Validation Rule' : 'Create Validation Rule'}
				</Button>
			</div>
		</div>
	</div>
{/if}
