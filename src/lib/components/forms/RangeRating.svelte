<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { questionSchema, type QuestionSchema } from './question.schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<QuestionSchema>>;
	const form = superForm(data, {
		validators: zodClient(questionSchema)
	});
	const { form: formData, enhance } = form;
</script>

<Form.Field {form} name="rangeMin">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Minimum Range</Form.Label>
			<Input {...props} bind:value={$formData.rangeMin} class="w-full" />
		{/snippet}
	</Form.Control>
	<Form.Description>Set the minimum value for the range.</Form.Description>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="rangeMax">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Maximum Range</Form.Label>
			<Input {...props} bind:value={$formData.rangeMax} class="w-full" />
		{/snippet}
	</Form.Control>
	<Form.Description>Set the maximum value for the range.</Form.Description>
	<Form.FieldErrors />
</Form.Field>
