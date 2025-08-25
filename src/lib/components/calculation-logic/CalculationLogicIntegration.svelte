<script lang="ts">
	import { toastMessage } from '../toast/toast.store.js';
	import { Button } from '../ui/button/index.js';
	import CalculationLogicBuilderFull from './CalculationLogicBuilderFull.svelte';
	import Icon from '@iconify/svelte';

	// Props
	let { questionCard = $bindable(), questionList } = $props();

	// State
	let showBuilder = $state(false);
	let calculationLogicRules = $state([]);
	let editingRule = $state(null);

	// Initialize calculation logic rules from backend data (table-friendly shape)
	$effect(() => {
		if (questionCard?.CalculateLogic?.Rules) {
			calculationLogicRules = questionCard.CalculateLogic.Rules.map((rule) => {
				const opType = (rule.OperationType || '').toLowerCase();
				const typeDisplay =
					opType === 'functionexpression'
						? 'Function Expression'
						: opType === 'logical'
							? 'Logical'
							: opType === 'composition'
								? 'Composition'
								: rule.OperationType || 'Calculation';
				return {
					id: rule.id,
					ruleName: rule.Name,
					typeDisplay,
					isActive: rule.IsActive !== false,
					description: rule.Description || rule.Name || 'No description available',
					createdAt: rule.CreatedAt,
					originalRule: rule
				};
			});
		} else {
			calculationLogicRules = [];
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

	async function handleSave(calculationData) {
		if (editingRule) {
			// Update existing rule
			const index = calculationLogicRules.findIndex((rule) => rule.id === editingRule.id);
			if (index !== -1) {
				calculationLogicRules[index] = {
					...calculationLogicRules[index],
					...calculationData,
					id: editingRule.id,
					createdAt: editingRule.createdAt
				};
			}
		} else {
			// Add the new rule to our list
			const response = await fetch(`/api/server/logic/calculation-logic`, {
				method: 'POST',
				body: JSON.stringify({
					FieldId: questionCard.id,
					Enabled: true
				}),
				headers: { 'content-type': 'application/json' }
			});
			const calculationLogicData = await response.json();
			toastMessage(calculationLogicData);
			console.log('CalculationLogicData: ', calculationLogicData);
		}

		// Close the builder
		closeBuilder(null);
	}

	function removeRule(index, event) {
		event?.preventDefault();
		event?.stopPropagation();
		calculationLogicRules.splice(index, 1);
	}
</script>

<!-- Calculation Logic Section -->
<div class="my-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h4 class="flex items-center gap-1 text-sm font-semibold text-gray-800">
				<Icon icon="lucide:calculator" class="h-3 w-3" />
				Calculation Logic
			</h4>
			{#if calculationLogicRules.length > 0}
				<span class="rounded border bg-white px-1.5 py-0.5 text-xs text-gray-600">
					{calculationLogicRules.length} rule{calculationLogicRules.length !== 1 ? 's' : ''}
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

	{#if calculationLogicRules.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-xs">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-100">
						<th class="p-2 text-left font-medium text-gray-700">Rule Name</th>
						<th class="p-2 text-left font-medium text-gray-700">Type</th>
						<th class="p-2 text-left font-medium text-gray-700">Is Active</th>
						<th class="p-2 text-left font-medium text-gray-700">Description</th>
						<th class="p-2 text-left font-medium text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each calculationLogicRules as rule, index}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="p-2 font-medium text-gray-800">{rule.ruleName || 'Unnamed Rule'}</td>
							<td class="p-2 text-gray-600">{rule.typeDisplay || 'Calculation'}</td>
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
							<td class="p-2 text-gray-600" title={rule.description}
								>{rule.description?.length > 40
									? `${rule.description.slice(0, 40)}...`
									: rule.description}</td
							>
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
										onclick={(e) => removeRule(index, e)}
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

<!-- Full Calculation Logic Builder Modal -->
<CalculationLogicBuilderFull
	bind:isOpen={showBuilder}
	onSave={handleSave}
	onCancel={closeBuilder}
	{editingRule}
	{questionList}
	currentField={questionCard}
/>
