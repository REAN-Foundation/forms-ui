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

	// Initialize calculation logic rules from backend data
	$effect(() => {
		if (questionCard?.CalculateLogic?.Rules) {
			calculationLogicRules = questionCard.CalculateLogic.Rules.map((rule) => ({
				id: rule.id,
				ruleName: rule.Name,
				targetField: rule.Operation?.TargetField || '',
				expression: rule.Operation?.Expression || '',
				conditionalCalculations: rule.Operation?.ConditionalCalculations || [],
				numberFormat: rule.Operation?.NumberFormat || 'decimal',
				decimalPlaces: rule.Operation?.DecimalPlaces || 2,
				createdAt: rule.CreatedAt
			}));
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
		<div class="max-h-48 space-y-2 overflow-y-auto">
			{#each calculationLogicRules as rule, index}
				<div class="rounded border border-gray-200 bg-white p-2 text-xs">
					<div class="flex items-start justify-between gap-2">
						<div class="min-w-0 flex-1">
							<div class="truncate font-medium text-gray-800">{rule.ruleName}</div>
							<div class="text-gray-600">
								Target: <span class="font-medium">{rule.targetField}</span>
							</div>
							<div class="mt-1 truncate rounded bg-gray-100 p-1 font-mono text-xs text-gray-500">
								{rule.expression}
							</div>
							{#if rule.conditionalCalculations && rule.conditionalCalculations.length > 0}
								<div class="mt-1 text-xs text-blue-600">
									{rule.conditionalCalculations.length} conditional calculation(s)
								</div>
							{/if}
							<div class="mt-1 text-xs text-gray-500">
								Format: {rule.numberFormat} • Decimals: {rule.decimalPlaces}
							</div>
						</div>
						<div class="flex flex-shrink-0 gap-1">
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
					</div>
				</div>
			{/each}
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
/>
