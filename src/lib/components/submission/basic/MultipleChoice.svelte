<script lang="ts">
  import { Label } from '$lib/components/ui/label/index.js';

  // Props from parent component
  let { q, answers = $bindable(), errors = $bindable() } = $props();

  // Extract options using 'Text' field
  let optionsArray: string[] = $state(q.Options?.map((option) => option.Text.trim()) || []);

  // Convert answers[q.id] from comma-separated string to array
  if (!Array.isArray(answers[q.id])) {
    answers[q.id] = answers[q.id] ? answers[q.id].split(',').map((val: string) => val.trim()) : [];
  }

  // Handle checkbox state changes
  function handleCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (target.checked) {
      if (!answers[q.id].includes(value)) {
        answers[q.id] = [...answers[q.id], value];
      }
    } else {
      answers[q.id] = answers[q.id].filter((item) => item !== value);
    }
  }
</script>

<!-- Render Question with Checkbox Options -->
<div class="flex w-full flex-col gap-1.5 p-4">
  <Label for="title">
    {q.Title || 'Select:'}
    {#if q.IsRequired}
      <span class="ml-1 text-red-600">*</span>
    {/if}
  </Label>

  <Label for="score" class="float-right">{q.Score || ''}</Label>
  <Label for="description" class="text-xs text-gray-500">{q.Description || ''}</Label>

  {#if optionsArray.length > 0}
    {#each optionsArray as o}
      <div class="flex items-center gap-2">
        <!-- Ensure checked state based on answers -->
        <input
          type="checkbox"
          class="input"
          name={q.id}
          value={o}
          id={o}
          checked={answers[q.id].includes(o)}
          onchange={handleCheckboxChange}
        />
        <Label for={o}>{o}</Label>
      </div>
    {/each}
  {:else}
    <p>No options are available for this question.</p>
  {/if}

  {#if errors[q.id]}
    <p class="mt-1 text-xs text-red-600">{errors[q.id]}</p>
  {/if}

  <div class="flex justify-end">
    <Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">{q.Hint || ''}</Label>
  </div>
</div>
