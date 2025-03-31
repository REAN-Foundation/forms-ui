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

	<div class="w-full space-y-3 rounded-lg">
		<div class="flex flex-col space-y-2">
		  <div class="flex items-center space-x-2">
			<Label for="systolic" class="text-slate-400 mr-2">Systolic</Label>
			<Input
			  disabled
			  type="text"
			  name="systolic"
			  placeholder="Enter the systolic blood pressure here..."
			  class="w-full"
			/>
<!-- 
		 <div class="text-slate-400">
			mmHg
		 </div> -->
			
		  </div>
		  <div class="flex items-center space-x-2">
			<Label for="diastolic" class="text-slate-400">Diastolic</Label>
			<Input
			  disabled
			  type="text"
			  name="diastolic"
			  placeholder="Enter the distolic blood pressure here..."
			  class="w-full"
			/>
			<!-- <div class="text-slate-400">
				mmHg
			 </div> -->
		  </div>
		 
		</div>
	  </div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
