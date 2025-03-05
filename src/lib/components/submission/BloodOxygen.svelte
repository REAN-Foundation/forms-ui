<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	export let q;
	export let answers;
</script>

<!-- {#if q.Title} -->
	<div class="flex w-full flex-col gap-1.5 p-4">
		<Label for="title">{q.Title || 'No title provided'}</Label>

		<!-- <Label>Drop file here{q.ResponseType}</Label> -->

		<Label for="score" class="float-right">{q.Score || ''}</Label>

		<Label for="title" class="ml-4 text-slate-700"
			>{q.Description || 'No description provided'}</Label
		>

		<Input type="text" class=" w-full" name={q.id} bind:value={answers[q.id]} />

		<div class="flex justify-end">
			<Label for="hint" class="float-right ml-auto mt-4 justify-end p-2">{q.Hint || ''}</Label>
		</div>
	</div>
<!-- {/if} -->
