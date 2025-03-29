<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();
</script>

<Button
	class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500 hover:bg-[#f9fafb] hover:dark:bg-[#262626]"
	onclick={() => {
		openSheet(card);
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter blood pressure'}
		</h1>
	</div>
	<!-- <Input type="text" disabled placeholder="Enter Blood Pressure here..." class="w-full  p-2" /> -->


	<div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<!-- <p>Types </p> -->
			<div class="flex flex-col items-start justify-start space-y-2">
				<div class=" flex flex-row">
					<Label for="Celsius">Systolic </Label>
					<Input type="text" name="Celsius" value="Celsius" placeholder="Celsius" />
				</div>
				<div class=" flex flex-row">
					<Label for="Fahrenheit">Distolic</Label>
					<Input type="text" name="Fahrenheit" value="Fahrenheit" placeholder="Fahrenheit" />
				</div>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
