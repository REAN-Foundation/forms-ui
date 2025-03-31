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

	// isOpen controls the sidebar visibility on mobile devices.
	let { cards, measurements, typeOfQuestion, changeTypes, isOpen } = $props();

	// Toggle function to change sidebar visibility on mobile.
	const toggleSidebar = () => {
		isOpen = !isOpen;
	};
</script>

<!-- Mobile toggle icon (only visible below md breakpoint) -->
<button
	onclick={toggleSidebar}
	class="fixed left-0 top-0 z-50 rounded   dark:bg-[#0a0a0b] p-2.5 text-black dark:text-[#F6F8FA] md:hidden"
	aria-label="Toggle Sidebar"
>
	<Icon icon="mdi:menu" class="h-5 w-5" />
</button>

<!-- Sidebar: Always visible on md and larger; toggle on mobile -->
<div class="relative overflow-hidden {isOpen ? 'block' : 'hidden'} z-30 md:block">
	<div
		class="fixed h-screen w-[70%] space-y-4 bg-[#F6F8FA] px-4 py-6 dark:bg-[#0a0a0b] sm:w-[30%] xl:w-[25%]"
	>
		<Card.Root class="rounded-lg border-none p-4">
			<Card.Title class="text-md mb-3">Drag Section From Here</Card.Title>
			<div
				class="flex cursor-grab items-center justify-center"
				use:draggable={{ ...SectionTemplate, type: 'section' }}
				role="button"
				aria-label="Draggable new section template"
			>
				<Button
					class="w-full space-x-2 rounded-md bg-[#F6F8FA] dark:bg-[#0a0a0b]"
					variant="secondary"
				>
					<Icon
						icon="teenyicons:section-add-outline"
						width="16"
						height="16"
						class="mr-2 text-primary"
					/>
					Add Section
				</Button>
			</div>
		</Card.Root>
		<!-- Sidebar question -->
		<Card.Root class="space-y-3 rounded-lg border-none p-4 2xl:w-full">
			<Card.Title class="text-md">Question</Card.Title>
			<div class="flex flex-wrap rounded-md border bg-[#F6F8FA] py-2 dark:bg-[#0a0a0b] xl:px-12">
				<label class="mx-3 flex cursor-pointer items-center md:mx-4 xl:mx-2">
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
				<label class="flex cursor-pointer items-center md:mx-4 xl:mx-2">
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
		<!-- Sidebar question response types -->
		<Card.Root class="rounded-lg border-none p-4">
			<Card.Title class="text-md">Question Response Types</Card.Title>
			<div class="scrollbar-hide max-h-96 overflow-y-auto py-6 xl:h-auto">
				<ul class="space-y-2">
					{#if typeOfQuestion === 'Advanced'}
						{#each measurements as card}
							<li>
								<div
									class="w-full cursor-grab"
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
									class="w-full cursor-grab"
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
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
