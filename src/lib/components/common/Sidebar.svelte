<script lang="ts">
	import { number } from 'zod';
	import { draggable } from './dnd';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let SectionTemplate = {
		id: number,
		localId: number,
		name: '',
		type: 'Section',
		cards: [],
		subsections: [],
		subsectionCount: 0
	};

	let SubSectionTemplate = {
		databaseId: '',
		localId: number,
		name: '',
		type: 'Subsection',
		cards: []
	};

	export let cards;
	export let measurements;
	export let typeOfQuestion;
	export let changeTypes;
</script>
<!-- sidebar -->
<div class="relative w-full overflow-hidden md:ml-5 md:w-3/12">
	<div class="fixed space-y-4 px-4 py-6 ">
		<Card.Root class="rounded-lg border p-4 bg-[#fafaf9] dark:bg-[#0a0a0b] shadow-md ">
			<Card.Title class="text-md mb-3">Drag Section From Here</Card.Title>
			<div
				class="flex cursor-grab items-center justify-center"
				use:draggable={{ ...SectionTemplate, type: 'section' }}
				role="button"
				aria-label="Draggable new section template"
			>
				<Button class="w-full space-x-2 rounded-md border" variant="secondary">
					<Icon
						icon="teenyicons:section-add-outline"
						width="16"
						height="16"
						class=" mr-2 text-primary "
					/>
					Add Section
				</Button>
			</div>
		</Card.Root>

		<Card.Root class="space-y-3 rounded-lg border p-4 bg-[#fafaf9] dark:bg-[#0a0a0b] shadow-md">
			<Card.Title class="text-md">Question</Card.Title>
			<div class="mx-auto flex w-fit flex-row space-x-8 rounded-md border px-14 py-2 ">
				<label class="flex cursor-pointer items-center ">
					<input
						type="radio"
						name="layoutType"
						value="Basic"
						checked={typeOfQuestion === 'Basic'}
						onchange={changeTypes}
						class="sr-only"
					/>
					<span
						class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary"
					>
						<span
							class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'Basic'
								? 'opacity-100'
								: 'opacity-0'} transition-opacity duration-200 ease-in-out"
						></span>
					</span>
					Basic
				</label>
				<label class="flex cursor-pointer items-center">
					<input
						type="radio"
						name="layoutType"
						value="Advanced"
						checked={typeOfQuestion === 'Advanced'}
						onchange={changeTypes}
						class="sr-only"
					/>
					<span
						class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary"
					>
						<span
							class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'Advanced'
								? 'opacity-100'
								: 'opacity-0'} transition-opacity duration-200 ease-in-out"
						></span>
					</span>
					Advanced
				</label>
			</div>
		</Card.Root>

		<Card.Root class="rounded-lg border p-4 bg-[#fafaf9] dark:bg-[#0a0a0b] shadow-md">
			<Card.Title class="text-md  ">Question Response Types</Card.Title>
			<div class="scrollbar-hide max-h-80 overflow-y-auto py-4">
				<ul class="space-y-2">
					{#if typeOfQuestion === 'Advanced'}
						{#each measurements as card}
							<li>
								<div
									class="w-full cursor-grab "
									use:draggable={{ ...card, type: 'card' }}
									role="button"
									aria-label={`Draggable card: ${card.name}`}
								>
									<Button class="w-full justify-start space-x-2" variant="ghost">
										<Icon icon={card.icon} width="20" height="20" class="text-primary" />
										<span>{card.name}</span>
									</Button>
								</div>
							</li>
						{/each}
					{:else if typeOfQuestion === 'Basic'}
						{#each cards as card}
							<li>
								<div
									class="w-full cursor-grab  "
									use:draggable={{ ...card, type: 'card' }}
									role="button"
									aria-label={`Draggable card: ${card.name}`}
								>
									<Button class="w-full justify-start space-x-2" variant="ghost">
										<Icon icon={card.icon} width="20" height="20" class="text-primary" />
										<span>{card.name}</span>
									</Button>
								</div>
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</Card.Root>
	</div>
</div>

<style>
	label:hover .relative {
		transform: scale(1.1);
		transition: transform 0.2s ease-in-out;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
