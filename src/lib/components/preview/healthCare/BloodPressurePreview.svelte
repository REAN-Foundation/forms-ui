<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class=" mt-4 w-full justify-between rounded-md border p-4 pb-10">
	<div>
		<Label for="title" class="text-md">{question.Title || 'Question Title'}</Label>
		<Label for="score" class="float-right">{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
		<br />
		
		<!-- <div class="h-fit w-full p-2">
			<div
				class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
			>
			
				<div class="flex flex-col items-start justify-start space-y-2">
					<div class=" flex flex-row">
						<Label for="Celsius">Systolic</Label>
						<Input type="text" name="Celsius" value="Celsius" placeholder="Celsius" />
					</div>
					<div class=" flex flex-row">
						<Label for="Fahrenheit">Distolic</Label>
						<Input type="text" name="Fahrenheit" value="Fahrenheit" placeholder="Fahrenheit" />
					</div>
				</div>
			</div>
		</div> -->

		<div class="w-full space-y-3 rounded-lg mt-6">
			<div class="flex flex-col space-y-2">
			  <div class="flex items-center space-x-2">
				<Label for="systolic" class=" mr-2">Systolic</Label>
				<Input
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
				<Label for="diastolic" class="">Diastolic</Label>
				<Input
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
	</div>

	<Label for="title" class="ml-2 text-xs">{question.Description || ''}</Label><br />
	<Label for="hint" class="float-right ml-auto mt-4 text-xs text-slate-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</Label
	>
</div>
