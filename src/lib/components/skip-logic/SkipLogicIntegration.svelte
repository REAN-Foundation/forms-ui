<script lang="ts">
	import { toastMessage } from '../toast/toast.store.js';
    import { Button } from '../ui/button/index.js';
    import SkipLogicBuilderFull from './SkipLogicBuilderFull.svelte';
    import Icon from '@iconify/svelte';

    // Props
    let { questionCard = $bindable(), questionList } = $props();

	// State
	let showBuilder = $state(false);
	let skipLogicRules = $state([]);
	let editingRule = $state(null);
	let deleteButtonClicked = $state(false);
	let ruleToDelete = $state(null);

    // Initialize skip logic rules from backend data (table-friendly shape)
    $effect(() => {
        if (questionCard?.SkipLogic?.Rules) {
            skipLogicRules = questionCard.SkipLogic.Rules.map(rule => {
                const opType = (rule.OperationType || '').toLowerCase();
                const typeDisplay = 
                    opType === 'logical' 
                        ? 'Logical' 
                        : opType === 'composition' 
                            ? 'Composition' 
                            : rule.OperationType || 'Skip';
                
                return {
                    id: rule.id,
                    ruleName: rule.Name,
                    typeDisplay,
                    isActive: rule.IsActive !== false,
                    description: rule.Description || rule.Name || 'No description available',
                    createdAt: rule.CreatedAt,
                    skipWhenTrue: rule.SkipWhenTrue,
                    conditions: rule.Operation?.Operands || [],
                    actions: rule.Operation?.Actions || [],
                    operator: rule.Operation?.Operator || '',
                    fieldReference: rule.Operation?.FieldReference || '',
                    value: rule.Operation?.Value || '',
                    // Preserve the complete original rule data with all skip logic details
                    originalRule: {
                        // Basic rule info
                        id: rule.id,
                        Name: rule.Name,
                        Description: rule.Description,
                        Priority: rule.Priority,
                        IsActive: rule.IsActive,
                        SkipWhenTrue: rule.SkipWhenTrue,
                        CreatedAt: rule.CreatedAt,
                        UpdatedAt: rule.UpdatedAt,
                        DeletedAt: rule.DeletedAt,
                        
                        // Operation details
                        Operation: rule.Operation,
                        OperationId: rule.OperationId,
                        OperationType: rule.OperationType,
                        BaseOperationId: rule.BaseOperationId,
                        
                        // Fallback rules with complete details
                        FallbackRule: rule.FallbackRule ? {
                            id: rule.FallbackRule.id,
                            Name: rule.FallbackRule.Name,
                            Description: rule.FallbackRule.Description,
                            Action: rule.FallbackRule.Action,
                            ActionMessage: rule.FallbackRule.ActionMessage,
                            ActionParameters: rule.FallbackRule.ActionParameters,
                            BaseOperationId: rule.FallbackRule.BaseOperationId,
                            OperationType: rule.FallbackRule.OperationType,
                            Priority: rule.FallbackRule.Priority,
                            IsActive: rule.FallbackRule.IsActive,
                            CreatedAt: rule.FallbackRule.CreatedAt,
                            UpdatedAt: rule.FallbackRule.UpdatedAt,
                            DeletedAt: rule.FallbackRule.DeletedAt
                        } : null,
                        FallbackRuleId: rule.FallbackRuleId,
                        
                        // Base fallback rule (Then fallback rule) with complete details
                        BaseFallbackRule: rule.BaseFallbackRule ? {
                            id: rule.BaseFallbackRule.id,
                            Name: rule.BaseFallbackRule.Name,
                            Description: rule.BaseFallbackRule.Description,
                            Action: rule.BaseFallbackRule.Action,
                            ActionMessage: rule.BaseFallbackRule.ActionMessage,
                            ActionParameters: rule.BaseFallbackRule.ActionParameters,
                            BaseOperationId: rule.BaseFallbackRule.BaseOperationId,
                            OperationType: rule.BaseFallbackRule.OperationType,
                            Priority: rule.BaseFallbackRule.Priority,
                            IsActive: rule.BaseFallbackRule.IsActive,
                            CreatedAt: rule.BaseFallbackRule.CreatedAt,
                            UpdatedAt: rule.BaseFallbackRule.UpdatedAt,
                            DeletedAt: rule.BaseFallbackRule.DeletedAt
                        } : null,
                        BaseFallbackRuleId: rule.BaseFallbackRuleId,
                        
                        // Logic reference
                        LogicId: rule.LogicId,
                        
                        // Complete skip logic structure
                        SkipLogic: questionCard.SkipLogic
                    }
                };
            });
        } else {
            skipLogicRules = [];
        }
    });

    function openBuilder(event, rule = null) {
        event?.preventDefault();
        event?.stopPropagation();
        editingRule = rule;
        showBuilder = true;
    }

    function closeBuilder(event) {
        event?.preventDefault();
        event?.stopPropagation();
        showBuilder = false;
        editingRule = null;
    }

    async function handleSave() {
        toastMessage({ Message: 'Skip rule saved', HttpCode: 200 });
        showBuilder = false;
        editingRule = null;
    }


	// Helper function to truncate text
	function truncateText(text, maxLength = 15) {
		if (!text) return '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	// For opening the delete modal
	function openDeleteModal(rule) {
		ruleToDelete = rule;
		deleteButtonClicked = true;
	}

	// For closing the delete modal
	function closeDeleteModal() {
		deleteButtonClicked = false;
		ruleToDelete = null;
	}

	// For confirming the delete action
	async function confirmDelete() {
		if (!ruleToDelete) return;

		try {
			// Call the delete API
			const response = await fetch(`/api/server/rules/skip-rule/${ruleToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Remove from local state
				skipLogicRules = skipLogicRules.filter(rule => rule.id !== ruleToDelete.id);
				toastMessage({ Message: 'Skip rule deleted successfully', HttpCode: 200 });
			}
		} catch (error) {
		}

		closeDeleteModal();
	}
</script>

<!-- Skip Logic Section -->
<div class="my-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h4 class="flex items-center gap-1 text-sm font-semibold text-gray-800">
				<Icon icon="lucide:skip-forward" class="h-3 w-3" />
				Skip Logic
			</h4>
			{#if skipLogicRules.length > 0}
				<span class="rounded border bg-white px-1.5 py-0.5 text-xs text-gray-600">
					{skipLogicRules.length} rule{skipLogicRules.length !== 1 ? 's' : ''}
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
    
	{#if skipLogicRules.length > 0}
		<!-- Skip Logic Rules Table -->
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
					{#each skipLogicRules as rule, index}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="p-2 font-medium text-gray-800">
								{rule.ruleName || 'Unnamed Rule'}
							</td>
							<td class="p-2 text-gray-600">
								{rule.typeDisplay || 'Skip'}
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

<!-- Full Skip Logic Builder Modal -->
<SkipLogicBuilderFull
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
					This action cannot be undone. This will permanently delete your skip rule and remove
					your data from our servers.
				</p>
			</div>

			<div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
				<Button
					type="button"
					variant="outline"
					onclick={closeDeleteModal}
					class="mt-3 sm:mt-0"
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					onclick={confirmDelete}
					class="bg-red-600 hover:bg-red-700"
				>
					Delete
				</Button>
			</div>
		</div>
	</div>
{/if} 