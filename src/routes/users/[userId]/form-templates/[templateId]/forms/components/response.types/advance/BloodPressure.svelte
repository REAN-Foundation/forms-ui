<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { getQuestionById } from '../../apiFunctions';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	////////////////////////////////////////////////////////////////
	
	let { close, submit, open, responseType, id, card } = $props();
	const templateId = $derived(page.params.templateId);
	const userId = $derived(page.params.userId);

	function questionEditRoute(id) {
		goto(`/users/${userId}/form-templates/${templateId}/forms/${id}/question-edit`);
	}
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={async () => questionEditRoute(id)}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter blood pressure'}
		</h1>
	</div>
	<Input type="text" disabled placeholder="Enter Blood Pressure here..." class="w-full  p-2" />
	<div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<p>Select Type :</p>
			<div class="flex flex-col items-start justify-start space-y-2">
				<div>
					<input type="checkbox" name="Celsius" value="Celsius" placeholder="Celsius" />
					<label for="Celsius">Systolic (Under 120 mmHg)</label>
				</div>
				<div>
					<input type="checkbox" name="Fahrenheit" value="Fahrenheit" placeholder="Fahrenheit" />
					<label for="Fahrenheit">Distolic (Under 80 mmHg)</label>
				</div>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
