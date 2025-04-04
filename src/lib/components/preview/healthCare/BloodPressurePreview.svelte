<script lang="ts">
	import Input from '../../ui/input/input.svelte';
	import Label from '../../ui/label/label.svelte';

	let { question } = $props();
	// console.log(question)
</script>

<div class=" space-y-2 rounded-lg px-4 pt-4">
	<div class="flex items-center justify-between">
		<Label for="title" class="text-sm"
			>{question.Title || 'Question Title'}
			{#if question.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</Label>
		<Label for="score" class="text-sm font-medium"
			>{question.Score ? `Score: ${question.Score}` : ''}</Label
		>
	</div>
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

	<div class=" w-full space-y-2 rounded-lg">
		<div class="flex flex-col space-y-2">
			<div class="flex items-center space-x-3">
				<Label for="systolic" class="text-sm">Systolic</Label>
				<Input
					type="text"
					name="systolic"
					disabled
					placeholder="Enter the systolic blood pressure here..."
					class=""
				/>
				<!-- 	
			 <div class="text-slate-400">
				mmHg
			 </div> -->
			</div>
			<div class="flex items-center space-x-2">
				<Label for="diastolic" class=" text-sm">Diastolic</Label>
				<Input
					type="text"
					disabled
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

	<Label for="title" class="ml-2 text-xs">{question.Description || ''}</Label><br />
	<p class=" text-end text-xs text-slate-500"
		>{question.Hint ? `Hint: ${question.Hint}` : ''}</p
	>
</div>
