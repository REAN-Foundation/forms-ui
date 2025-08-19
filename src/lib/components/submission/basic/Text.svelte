<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	///////////////////////////////////////////////////////////////////////////

    let { q, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();
    import { backendSectionsToEngineForm, FormRuleExecutor } from '../engine';
    import { getContext } from 'svelte';
    
    // Allow parent to pass sections via context for evaluation
    const sections = getContext<any[]>('qp_sections');
    
    function runEval() {
        if (!sections) return;
        const form = backendSectionsToEngineForm(sections ?? [], 'runtime');
        const ex = new FormRuleExecutor(form);
        Object.entries(answers || {}).forEach(([fieldId, value]) => ex.setFieldValue(fieldId, value));
        const result = ex.executeFieldLogics(q.id);
        // Push calculated value into answers if present
        if (result.calculatedValue !== undefined) {
            answers[q.id] = result.calculatedValue;
        }
        // Apply validation errors
        if (result.validationErrors?.length) {
            errors[q.id] = result.validationErrors[0];
        } else {
            delete errors[q.id];
        }
    }
</script>

<div class="flex w-full flex-col gap-1.5 p-4">
	<div class="flex flex-row justify-between items-center">
		<Label for={q.Title}
			>{q.Title || 'No title provided'}
			{#if q.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		<Label for="score">{q.Score || ''}</Label>
	</div>

	{#if q.Description}
		<Label class="ml-2">{q.Description}</Label>
	{/if}

    <Input name={q.id} bind:value={answers[q.id]} type="text" class="mt-2" disabled={isSubmitted} />

	{#if errors[q.id]}
		<p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
	{/if}

	{#if q.Hint}
		<Label class="self-end text-xs text-gray-400">Hint: {q.Hint}</Label>
	{/if}
</div>
