<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label/index.js';

    let { q, answers = $bindable(), errors = $bindable() } = $props();

    let selectedOptions = $state([]);

    $effect(() => {
            if (answers[q.id]) {
                selectedOptions = JSON.parse(answers[q.id]);
            }
        });

    let optionsArray: string[] = $state(q.Options?.map((option) => option.Text.trim()) || []);

    function handleCheckboxChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (target.checked) {
        selectedOptions = [...selectedOptions, value];
        answers[q.id] = JSON.stringify(selectedOptions);
        } else {
        selectedOptions = selectedOptions.filter((item) => item !== value);
        answers[q.id] = JSON.stringify(selectedOptions);
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
  <Input type="text" class="hidden w-full" bind:value={answers[q.id]}  />
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
          checked={selectedOptions.includes(o)}
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
