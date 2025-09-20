<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { Textarea } from '../ui/textarea/index.js';
	import RegexValidationRule from './RegexValidationRule.svelte';
	import LogicalValidationRule from './LogicalValidationRule.svelte';
	import FallbackRuleInput from '../fallback-logic/FallbackRuleInput.svelte';
	import { FallbackActionType, OperationType } from '$lib/components/submission/engine/types/fallback-rule';
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

	// State
	let isEditing = $derived(!!editingRule);
	let viewOnlyEditing = $derived(!!editingRule);
	let shouldTriggerSave = $state(false);
	let errors = $state({} as Record<string, string>);
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

	// Form fields
	let ruleName = $state('');
	let ruleDescription = $state('');
	let rulePriority = $state(1);
	let activeTab = $state('regex'); // Default to regex
	let selectedField = $state('');
	let activeRegexPreset = $state('');
	let regexPattern = $state('');
	let testInput = $state('');
	let testResult = $state('');
	let testResultClass = $state('');
	let errorMessage = $state('');
	
	// Fallback rule state
	let fallbackAction = $state(FallbackActionType.SHOW_MESSAGE);
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

	// Logical validation fields
	let conditions = $state([
		{
			field: '',
			operator: '',
			value: '',
			connector: ''
		}
	]);

	// Composite validation fields
	let compositeConditions = $state([
		{
			field: '',
			operator: '',
			value: '',
			connector: ''
		}
	]);
	let compositeOperator = $state('And');

	// Validation logic and rule IDs
	let logicId = $state(currentField?.ValidateLogic?.id || '');
	let ruleId = $state('');

	// Validation type selection
	let selectedValidationType = $state('regex'); // 'regex' or 'logical'

	// ------------------------------
	// Read-only summary for editing
	// ------------------------------
	function parseMaybeJson(val: any) {
		if (val == null) return null;
		if (typeof val === 'string') {
			try {
				return JSON.parse(val);
			} catch {
				return null;
			}
		}
		return val;
	}

	function normalizeOperand(op: any) {
		return {
			Type: op?.Type,
			DataType: op?.DataType,
			Value: op?.Value,
			FieldId: op?.FieldId,
			FieldCode: op?.FieldCode
		};
	}

	function normalizeOperation(op: any): any {
		if (!op) return null;
		const Type = op.Type;
		if (Type === 'Logical' || Type === 'Mathematical') {
			const raw = parseMaybeJson(op.Operands) ?? op.Operands ?? [];
			const Operands = (raw as any[]).map(normalizeOperand);
			return { ...op, Operands };
		}
		if (Type === 'Composition') {
			const children = Array.isArray(op.Children) ? op.Children.map(normalizeOperation) : [];
			return { ...op, Children: children };
		}
		if (Type === 'FunctionExpression') {
			const rawVars = parseMaybeJson(op.Variables) ?? op.Variables ?? {};
			return { ...op, Variables: rawVars };
		}
		return op;
	}

	// Function to reset trigger flag
	function resetTriggerFlag() {
		shouldTriggerSave = false;
	}

	function resetForCreate() {
		// Reset rule metadata
		ruleName = '';
		ruleDescription = '';
		rulePriority = 1;
		errorMessage = '';
		fallbackAction = FallbackActionType.SHOW_MESSAGE;
		fallbackActionMessage = 'Validation failed, please check your input';
		// Reset type-specific fields
		selectedValidationType = 'regex';
		activeTab = 'regex';
		selectedField = '';
		activeRegexPreset = '';
		regexPattern = '';
		testInput = '';
		testResult = '';
		testResultClass = '';
		conditions = [{ field: '', operator: '', value: '', connector: '' }];
		compositeConditions = [{ field: '', operator: '', value: '', connector: '' }];
		compositeOperator = 'And';
		// Keep logicId from currentField if present; do not reset it
		ruleId = '';
		errors = {} as Record<string, string>;
	}

	// Function to show specific tab
	function showTab(tabName: string) {
		if (!isEditing) {
			activeTab = tabName;
		}
	}

	// Effect to initialize form per mode (edit/create) when modal opens
	$effect(() => {
		if (!isOpen) return;
		if (!isEditing) {
			resetForCreate();
			return;
		}
		// For editing: show read-only summary and detect type
		const originalRule = editingRule?.originalRule;
		if (!originalRule) return;
		ruleName = originalRule.Name || originalRule.name || '';
		ruleDescription = originalRule.Description || originalRule.description || '';
		errorMessage = originalRule.ErrorMessage || '';
		const op = normalizeOperation(originalRule.Operation);
		if (op?.Type === 'FunctionExpression') {
			selectedValidationType = 'regex';
		} else {
			selectedValidationType = 'logical';
		}
	});

	// Async function to fetch composite conditions
	async function fetchCompositeConditions(children: string[]) {
		const fetchedConditions = [];

		for (const operationId of children) {
			try {
				// Fetch the logical operation details
				const response = await fetch(`/api/server/operations/logical-operation/${operationId}`);
				if (response.ok) {
					const operationData = await response.json();
					const operation = operationData.Data;

					// Parse the operands to extract field, operator, and value
					if (operation.Operands) {
						const operands = JSON.parse(operation.Operands);

						// Extract field information from first operand
						let fieldTitle = '';
						if (operands[0] && operands[0].Type === 'FieldReference') {
							// Find the field in questionList
							for (const section of questionList) {
								for (const field of section.FormFields) {
									if (
										field.id === operands[0].FieldId ||
										field.DisplayCode === operands[0].FieldCode
									) {
										fieldTitle = field.Title || field.DisplayCode;
										break;
									}
								}
								if (fieldTitle) break;
							}
						}

						// Map operator back to display name
						let operatorDisplay = '';
						switch (operation.Operator) {
							case 'Equal':
								operatorDisplay = 'Equal To';
								break;
							case 'NotEqual':
								operatorDisplay = 'Not Equal To';
								break;
							case 'GreaterThan':
								operatorDisplay = 'Greater Than';
								break;
							case 'LessThan':
								operatorDisplay = 'Less Than';
								break;
							case 'GreaterThanOrEqual':
								operatorDisplay = 'Greater Than or Equal';
								break;
							case 'LessThanOrEqual':
								operatorDisplay = 'Less Than or Equal';
								break;
							case 'Contains':
								operatorDisplay = 'Contains';
								break;
							case 'DoesNotContain':
								operatorDisplay = 'Does Not Contain';
								break;
							case 'Exists':
								operatorDisplay = 'Is Not Empty';
								break;
							case 'IsTrue':
								operatorDisplay = 'Is True';
								break;
							case 'IsFalse':
								operatorDisplay = 'Is False';
								break;
							default:
								operatorDisplay = 'Equal To';
						}

						// Extract value from second operand if it exists
						let value = '';
						if (operands[1] && operands[1].Type === 'Constant') {
							value = operands[1].Value || '';
						}

						fetchedConditions.push({
							field: fieldTitle,
							operator: operatorDisplay,
							value: value,
							connector: ''
						});
					}
				}
			} catch (fetchError) {
				console.error(`Error fetching operation ${operationId}:`, fetchError);
			}
		}

		// Set the populated conditions
		if (fetchedConditions.length > 0) {
			compositeConditions = fetchedConditions;
		} else {
			// Fallback to empty condition if fetching failed
			compositeConditions = [
				{
					field: '',
					operator: '',
					value: '',
					connector: ''
				}
			];
		}
	}



	function handleCancel() {
		isOpen = false;
		onCancel?.();
	}

	// Handler functions for child component callbacks
	async function handleRegexOperationCreated(event: CustomEvent) {
		resetTriggerFlag();

		// Create fallback rule first for both new and edit operations
		let fallbackRuleId = null;
		fallbackRuleId = await createOrUpdateFallbackRule(event.detail?.operationId, OperationType.Logical);
		if (!fallbackRuleId) {
			console.warn('Failed to create fallback rule, proceeding without it');
		}

		// If this is an edit operation, close modal directly
		if (event.detail.isEdit) {
			isOpen = false;
			onSave?.();
			invalidateAll();
		} else {
			// Create main rule with fallback rule ID
			await handleSubmit(event.detail, fallbackRuleId);
		}
	}

	async function handleLogicalOperationsCreated(event: CustomEvent) {
		shouldTriggerSave = false;
		
		// Create fallback rule first for both new and edit operations
		let fallbackRuleId = null;
		fallbackRuleId = await createOrUpdateFallbackRule(event.detail?.operationId, OperationType.Composition);
		if (!fallbackRuleId) {
			console.warn('Failed to create fallback rule, proceeding without it');
		}

		// If this came from an edit flow, do not create a new rule
		if (event.detail?.isEdit) {
			isOpen = false;
			onSave?.();
			invalidateAll();
			return;
		}
		// Create main rule with fallback rule ID
		await handleSubmit(event.detail, fallbackRuleId);
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

	// Create a new fallback rule
	async function createFallbackRule(operationId?: string, operationType?: string): Promise<string | null> {
		// Determine operation type based on validation type or use passed parameter
		const finalOperationType = operationType || (selectedValidationType === 'regex' ? OperationType.Logical : OperationType.Composition);
		
		const fallbackRule = {
			Name: `${ruleName} - Fallback Rule`,
			Description: `Fallback rule for ${ruleName}`,
			Priority: 1,
			IsActive: true,
			OperationType: finalOperationType,
			BaseOperationId: operationId || '',
			Action: fallbackAction,
			ActionMessage: fallbackActionMessage,
			ActionParameters: filterEmptyActionParameters(fallbackActionParameters)
		};

		try {
			const response = await fetch('/api/server/rules/fallback-rule', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(fallbackRule)
			});

			const result = await response.json();
			if (response.ok && result.Data?.id) {
				// Clear any previous server errors on success
				serverErrors = {};
				return result.Data.id;
			} else {
				console.error('Failed to create fallback rule:', result.Message);
				
				// Parse and display server validation errors
				if (result.Message) {
					serverErrors = parseServerErrors(result.Message);
					console.error('Server validation errors:', serverErrors);
				}
			}
		} catch (error) {
			console.error('Error creating fallback rule:', error);
			serverErrors = { general: 'Network error occurred while creating fallback rule' };
		}

		return null;
	}

	// Update an existing fallback rule
	async function updateFallbackRule(fallbackRuleId: string, operationId?: string, operationType?: string): Promise<string | null> {
		// Determine operation type based on validation type or use passed parameter
		const finalOperationType = operationType || (selectedValidationType === 'regex' ? OperationType.Logical : OperationType.Composition);
		
		const fallbackRule = {
			Name: `${ruleName} - Fallback Rule`,
			Description: `Fallback rule for ${ruleName}`,
			Priority: 1,
			IsActive: true,
			OperationType: finalOperationType,
			BaseOperationId: operationId || '',
			Action: fallbackAction,
			ActionMessage: fallbackActionMessage,
			ActionParameters: filterEmptyActionParameters(fallbackActionParameters)
		};

		try {
			const response = await fetch(`/api/server/rules/fallback-rule/${fallbackRuleId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(fallbackRule)
			});

			const result = await response.json();
			if (response.ok) {
				// Clear any previous server errors on success
				serverErrors = {};
				return fallbackRuleId; // Return the same ID since we're updating
			} else {
				console.error('Failed to update fallback rule:', result.Message);
				
				// Parse and display server validation errors
				if (result.Message) {
					serverErrors = parseServerErrors(result.Message);
					console.error('Server validation errors:', serverErrors);
				}
			}
		} catch (error) {
			console.error('Error updating fallback rule:', error);
			serverErrors = { general: 'Network error occurred while updating fallback rule' };
		}

		return null;
	}

	// Load fallback rule data for editing
	async function loadFallbackRuleData() {
		// First check if fallback rule data is already available in editingRule.originalRule
		if (editingRule?.originalRule?.FallbackRule) {
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

	// Initialize editing mode
	$effect(() => {
		if (editingRule && isOpen) {
			loadFallbackRuleData();
		}
	});

	// New function that creates fallback rule first, then main rule
	async function handleSubmitWithFallback(operationData: any) {
		// Step 0: Create fallback rule first (always create one)
		let fallbackRuleId = null;
		const operationType = selectedValidationType === 'regex' ? OperationType.Logical : OperationType.Composition;
		fallbackRuleId = await createOrUpdateFallbackRule(operationData?.operationId, operationType);
		if (!fallbackRuleId) {
			console.warn('Failed to create fallback rule, proceeding without it');
		}

		// Now call the original handleSubmit with the fallback rule ID
		await handleSubmit(operationData, fallbackRuleId);
	}

	async function handleSubmit(operationData: any, fallbackRuleId: string | null = null) {
		try {
			// Reset errors
			errors = {};

			// Validate required fields
			if (!ruleName.trim()) {
				errors.ruleName = 'Rule name is required';
			}

			// Validate operation linkage (must have type and id)
			if (!operationData || !operationData.operationType || !operationData.operationId) {
				errors.general = 'Missing operation. Please create or select a condition first.';
				toastMessage({ Message: 'Missing operation: create/select a condition first', HttpCode: 400 });
				return;
			}

			// If there are validation errors, don't proceed
			if (Object.keys(errors).length > 0) {
				return;
			}

			// Use the passed fallbackRuleId
			let finalFallbackRuleId = fallbackRuleId;

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
					BaseOperationId: operationData.operationId, // Add BaseOperationId same as OperationId
					ErrorWhenFalse: true,
					ErrorMessage: errorMessage,
					LogicId: logicId,
					FallbackRuleId: finalFallbackRuleId || undefined
				};

				const ruleResponse = await fetch('/api/server/rules/validation-rule', {
					method: 'POST',
					body: JSON.stringify(ruleData),
					headers: { 'content-type': 'application/json' }
				});

				const ruleResult = await ruleResponse.json();
				toastMessage(ruleResult);
				ruleId = ruleResult.Data.id;
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
					console.error('Field update error:', errorData);
					toastMessage(errorData);
					throw new Error(errorData.Message || 'Failed to update form field with validation logic');
				} else {
					console.log('Form field updated with validation logic');
				}
			} else {
				console.log('Skipping field update - missing logicId or ruleId:', { logicId, ruleId });
			}

			// Close modal on successful operation
			isOpen = false;
			onSave?.();
			invalidateAll();
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			errors.general = error.message;
		}
		invalidateAll();
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
				<!-- <div class="mb-4">
					<Label class="mb-2 block font-semibold text-slate-700">Priority</Label>
					<Input
						type="number"
						bind:value={rulePriority}
						min="1"
						max="10"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm"
					/>
                </div> -->

				<!-- Validation Type Selection -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Validation Type</Label>
					<Select.Root type="single" bind:value={selectedValidationType} disabled={false}>
						<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
							{selectedValidationType === 'regex'
								? 'Regex Pattern Validation'
								: 'Logical Condition Validation'}
						</Select.Trigger>
						<Select.Content portalProps={{}}>
							<Select.Item value="regex" label="Regex Pattern Validation" />
							<Select.Item value="logical" label="Logical Condition Validation" />
						</Select.Content>
					</Select.Root>
					{#if isEditing}
						<p class="mt-1 text-sm text-blue-600">
							💡 Validation type cannot be changed while editing
						</p>
					{/if}
				</div>

				<!-- Validation Type Content -->
				{#key selectedValidationType}
					{#if selectedValidationType === 'regex'}
						<RegexValidationRule
							{isEditing}
							{editingRule}
							{currentField}
							{questionList}
							{ruleName}
							{ruleDescription}
							{activeRegexPreset}
							{regexPattern}
							{selectedField}
							{handleRegexOperationCreated}
							{shouldTriggerSave}
						/>
					{:else if selectedValidationType === 'logical'}
						<LogicalValidationRule
							{isEditing}
							{editingRule}
							{currentField}
							{ruleName}
							{ruleDescription}
							{questionList}
							{conditions}
							{shouldTriggerSave}
							{handleLogicalOperationsCreated}
						/>
					{/if}
				{/key}

				<!-- Validation Messages Section -->
				<div class="mb-5 rounded-md border-2 border-gray-200 bg-white p-4">
					<h3 class="mb-4 font-medium text-slate-700">Validation Messages</h3>
					<div class="mb-0">
						<Label class="mb-2 block font-semibold text-slate-700">Error Message</Label>
						<Textarea
							bind:value={errorMessage}
							placeholder="Enter validation error message"
							class="resize-vertical h-24 w-full rounded-md border-2 border-gray-200 p-3 text-sm"
						/>
					</div>
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
							Define what should happen when this validation rule fails or encounters an error.
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
					onclick={() => (shouldTriggerSave = true)}
					class="rounded-md bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-800"
				>
					Save Validation Rule
				</Button>
			</div>
		</div>
	</div>
{/if}
