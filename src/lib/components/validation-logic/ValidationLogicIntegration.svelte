<script lang="ts">
	import { toastMessage } from '../toast/toast.store.js';
	import { Button } from '../ui/button/index.js';
	import ValidationLogicBuilderFull from './ValidationLogicBuilderFull.svelte';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	/////////////////////////////////////////////////////////////////////////////////////////

	// Props
	let { questionCard = $bindable(), questionList } = $props();

	$inspect('questionCard from ValidationLogicIntegration.svelte', questionCard);
	// State
	let showBuilder = $state(false);
	let validationRules = $state([]);
	let editingRule = $state(null);
	let deleteButtonClicked = $state(false);
	let ruleToDelete = $state(null);

	// Initialize validation rules from backend data
	$effect(() => {
		if (questionCard?.ValidateLogic?.Rules) {
			validationRules = questionCard.ValidateLogic.Rules.map((rule) => {
				const opType = (rule.OperationType || '').toLowerCase();
				const isLogical = opType === 'logical';
				const isComposite = opType === 'composite';
				const isFunctionExpression = opType === 'functionexpression';

				// Handle composite operations with expanded children
				let conditions = [];
				if (isComposite && rule.Operation?.Children && Array.isArray(rule.Operation.Children)) {
					// Map expanded logical operation children to conditions format
					conditions = rule.Operation.Children.map((childOperation, index) => {
						// Parse the operands to extract field, operator, and value
						let field = '';
						let operator = '';
						let value = '';

						try {
							if (childOperation.Operands) {
								const operands = JSON.parse(childOperation.Operands);
								if (Array.isArray(operands) && operands.length >= 2) {
									// First operand is usually the field reference
									if (operands[0]?.FieldId) {
										field = operands[0].FieldId;
									}
									// Second operand is usually the value
									if (operands[1]?.Value !== undefined) {
										value = operands[1].Value;
									}
								}
							}
							operator = childOperation.Operator || '';
						} catch (error) {
							console.error('Error parsing logical operation operands:', error);
						}

						const condition = {
							field: field,
							operator: operator,
							value: value,
							connector: index > 0 ? 'AND' : null // Default connector for composite operations
						};
						return condition;
					});
				} else if (isLogical) {
					// Handle single logical operations
					conditions = [
						{
							field: rule.Operation?.FieldReference || '',
							operator: rule.Operation?.Operator || '',
							value: rule.Operation?.Value || '',
							connector: null
						}
					];
				} else {
					// Handle other operation types
					conditions = rule.Operation?.Operands || [];
				}

				const mappedRule = {
					id: rule.id,
					ruleName: rule.Name,
					activeTab: rule.OperationType?.toLowerCase() || 'logical',
					errorMessage: rule.ErrorMessage,
					conditions: conditions,
					operator: rule.Operation?.Operator || '',
					fieldReference: rule.Operation?.FieldReference || '',
					value: rule.Operation?.Value || '',
					regexPattern:
						rule.Operation?.RegexPattern || '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
					selectedField: rule.Operation?.FieldReference || null,
					compositeConditions: rule.Operation?.CompositeConditions || [],
					messageSeverity: rule.Operation?.MessageSeverity || 'error',
					successMessage: rule.Operation?.SuccessMessage || '',
					fallbackAction: rule.Operation?.FallbackAction || 'Allow submission with warning',
					createdAt: rule.CreatedAt,
					// Add the fields needed for the table
					isActive: rule.IsActive !== false, // Default to true if not specified
					description: rule.Description || rule.ErrorMessage || 'No description available',
					// Human-readable type for table display
					typeDisplay: isFunctionExpression ? 'Function Expression' : 'Logical',
					// Store the original rule data for editing
					originalRule: rule,
					// Store expanded logical operations for composite rules
					logicalOperations: isComposite ? rule.Operation?.Children || [] : []
				};

				return mappedRule;
			});
		}
	});

	function openBuilder(event, rule = null) {
		event?.preventDefault();
		event?.stopPropagation();
		if (rule) {
			// keep minimal logging to avoid noise
		}
		editingRule = rule;
		showBuilder = true;
	}

	function closeBuilder(event) {
		event?.preventDefault();
		event?.stopPropagation();
		invalidateAll();
		showBuilder = false;
		editingRule = null;
	}

	async function handleSave() {
		closeBuilder(null);
	}

	// For opening the delete modal
	function openDeleteModal(rule) {
		deleteButtonClicked = true;
		ruleToDelete = rule;
	}

	// For closing the delete modal
	function closeDeleteModal() {
		deleteButtonClicked = false;
		ruleToDelete = null;
	}

	// For confirming the deletion
	async function confirmDeleteRule() {
		if (!ruleToDelete) return;

		try {
			const response = await fetch(`/api/server/rules/validation-rule/${ruleToDelete.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const result = await response.json();

			if (result.HttpCode === 200) {
				toastMessage({ Message: 'Validation rule deleted successfully', HttpCode: 200 });

				// Remove the rule from the local state
				validationRules = validationRules.filter((rule) => rule.id !== ruleToDelete.id);

				// Refresh the data
				if (questionCard?.ValidateLogic?.Rules) {
					validationRules = questionCard.ValidateLogic.Rules.filter(
						(rule) => rule.id !== ruleToDelete.id
					).map((rule) => {
						const opType = (rule.OperationType || '').toLowerCase();
						const isLogical = opType === 'logical';
						const isComposite = opType === 'composite';

						// Handle composite operations with expanded children
						let conditions = [];
						if (isComposite && rule.Operation?.Children && Array.isArray(rule.Operation.Children)) {
							// Map expanded logical operation children to conditions format
							conditions = rule.Operation.Children.map((childOperation, index) => {
								// Parse the operands to extract field, operator, and value
								let field = '';
								let operator = '';
								let value = '';

								try {
									if (childOperation.Operands) {
										const operands = JSON.parse(childOperation.Operands);
										if (Array.isArray(operands) && operands.length >= 2) {
											// First operand is usually the field reference
											if (operands[0]?.FieldId) {
												field = operands[0].FieldId;
											}
											// Second operand is usually the value
											if (operands[1]?.Value !== undefined) {
												value = operands[1].Value;
											}
										}
									}
									operator = childOperation.Operator || '';
								} catch (error) {
									console.error('Error parsing logical operation operands:', error);
								}

								return {
									field,
									operator,
									value,
									connector: index > 0 ? 'AND' : null
								};
							});
						} else if (isLogical) {
							conditions = [
								{
									field: rule.Operation?.FieldReference || '',
									operator: rule.Operation?.Operator || '',
									value: rule.Operation?.Value || '',
									connector: null
								}
							];
						} else {
							conditions = rule.Operation?.Operands || [];
						}

						return {
							id: rule.id,
							ruleName: rule.Name,
							activeTab: rule.OperationType?.toLowerCase() || 'logical',
							errorMessage: rule.ErrorMessage,
							conditions,
							operator: rule.Operation?.Operator || '',
							fieldReference: rule.Operation?.FieldReference || '',
							value: rule.Operation?.Value || '',
							regexPattern:
								rule.Operation?.RegexPattern || '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
							selectedField: rule.Operation?.FieldReference || null,
							compositeConditions: rule.Operation?.CompositeConditions || [],
							messageSeverity: rule.Operation?.MessageSeverity || 'error',
							successMessage: rule.Operation?.SuccessMessage || '',
							fallbackAction: rule.Operation?.FallbackAction || 'Allow submission with warning',
							createdAt: rule.CreatedAt,
							isActive: rule.IsActive !== false,
							description: rule.Description || rule.ErrorMessage || 'No description available',
							typeDisplay: isComposite ? 'Logical' : 'Function Expression',
							originalRule: rule,
							logicalOperations: isComposite ? rule.Operation?.Children || [] : []
						};
					});
				}
			} else {
				console.error('Failed to delete rule:', result);
			}
		} catch (error) {
			console.error('Error deleting rule:', error);
		}
	}

	// Helper function to truncate text
	function truncateText(text, maxLength = 15) {
		if (!text) return '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}
</script>

<!-- Validation Logic Section -->
<div class="my-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h4 class="flex items-center gap-1 text-sm font-semibold text-gray-800">
				<Icon icon="lucide:search" class="h-3 w-3" />
				Validation Logic
			</h4>
			{#if validationRules.length > 0}
				<span class="rounded border bg-white px-1.5 py-0.5 text-xs text-gray-600">
					{validationRules.length} rule{validationRules.length !== 1 ? 's' : ''}
				</span>
			{/if}
		</div>
		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={(e) => openBuilder(e)}
			class="h-7 px-2 text-xs"
		>
			<Icon icon="lucide:plus" class="mr-1 h-3 w-3" />
			Add Rule
		</Button>
	</div>

	{#if validationRules.length > 0}
		<!-- Validation Rules Table -->
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-xs">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-100">
						<th class="p-2 text-left font-medium text-gray-700">Rule Name</th>
						<th class="p-2 text-left font-medium text-gray-700">Type of Rule</th>
						<th class="p-2 text-left font-medium text-gray-700">Is Active</th>
						<th class="p-2 text-left font-medium text-gray-700">Description</th>
						<th class="p-2 text-left font-medium text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each validationRules as rule, index}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="p-2 font-medium text-gray-800">
								{rule.ruleName || 'Unnamed Rule'}
							</td>
							<td class="p-2 text-gray-600">
								{rule.typeDisplay || 'Logical'}
							</td>
							<td class="p-2">
								<span
									class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
									class:bg-green-100={rule.isActive}
									class:text-green-800={rule.isActive}
									class:bg-red-100={!rule.isActive}
									class:text-red-800={!rule.isActive}
								>
									<Icon
										icon={rule.isActive ? 'lucide:check-circle' : 'lucide:x-circle'}
										class="mr-1 h-3 w-3"
									/>
									{rule.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="p-2 text-gray-600" title={rule.description}>
								{truncateText(rule.description, 15)}
							</td>
							<td class="p-2">
								<div class="flex gap-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={(e) => openBuilder(e, rule)}
										class="h-6 px-1 text-xs"
									>
										<Icon icon="lucide:edit" class="h-2.5 w-2.5" />
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={(e) => openDeleteModal(rule)}
										class="h-6 px-1 text-xs text-red-600 hover:text-red-700"
									>
										<Icon icon="lucide:trash-2" class="h-2.5 w-2.5" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Full Validation Logic Builder Modal -->
<ValidationLogicBuilderFull
	bind:isOpen={showBuilder}
	onSave={handleSave}
	onCancel={closeBuilder}
	{editingRule}
	currentField={questionCard}
	{questionList}
/>

<!-- Delete Confirmation Modal -->
{#if deleteButtonClicked}
	<div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"></div>

	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div
			class="relative z-50 w-full max-w-lg border bg-background p-6 shadow-lg sm:rounded-lg md:w-full"
		>
			<div class="flex flex-col space-y-2 text-center sm:text-left">
				<h1 class="text-lg font-semibold">Are you absolutely sure?</h1>
				<p class="text-sm text-muted-foreground">
					This action cannot be undone. This will permanently delete your validation rule and remove
					your data from our servers.
				</p>
			</div>

			<div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
				<Button variant="outline" onclick={closeDeleteModal}>Cancel</Button>
				<Button
					class="bg-destructive hover:bg-destructive dark:text-white"
					onclick={confirmDeleteRule}
				>
					Delete
				</Button>
			</div>
		</div>
	</div>
{/if}
