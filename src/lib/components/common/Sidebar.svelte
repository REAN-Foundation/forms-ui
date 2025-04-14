<script lang="ts">
	import { number } from 'zod';
	import { draggable } from './dnd';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	// import * as Tabs from '$lib/components/ui/tabs/index.js';

	///////////////////////////////////////////////////////////////////////////////////////////////////

	let {
		BasicPlugins,
		HealthCarePlugins,
		typeOfQuestion,
		changeTypes,
		isOpen,
		CommonPlugins,
		FinancialPlugins
	} = $props();

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

	const types = ['Basic', 'Common', 'HealthCare', 'Financial'];
	let selectedTab = $state('Basic');
	// let typeOfQuestion = 'Basic';

	// dummy plugin imports
	// import { BasicPlugins, CommonPlugins, HealthCarePlugins, FinancialPlugins } from './plugins';
	const pluginMap = {
		Basic: BasicPlugins,
		Common: CommonPlugins,
		HealthCare: HealthCarePlugins,
		Financial: FinancialPlugins
	};
</script>

<!-- sidebar add section -->
<div class=" my-2 h-full overflow-hidden md:fixed {isOpen ? 'block' : 'hidden'} md:block">
	<!-- <div class="sticky h-screen space-y-4 bg-[#F6F8FA] px-4 py-6 dark:bg-[#0A0A0B] md:fixed"> -->
	<Card.Root class="!rounded-none !border-none  px-4 py-5 !shadow-none  md:w-full ">
		<!-- <Card.Title class="text-md mb-3">Drag Section From Here</Card.Title> -->
		<div
			class="flex cursor-grab items-center justify-center"
			use:draggable={{ ...SectionTemplate, type: 'section' }}
			role="button"
			aria-label="Draggable new section template"
		>
			<Button
				class=" space-x-2 rounded-md border  dark:border-gray-400  md:w-full"
				variant="secondary"
			>
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
	<!-- Sidebar question -->
	<Card.Root class=" h-full !rounded-none !border-none   !shadow-none  md:w-full  2xl:w-full">
		<Card.Title class="text-md px-3">Select Types</Card.Title>
		<!-- <div class=" h-full rounded-md px-3 dark:border-gray-400">
			<div
				class=" flex flex-col justify-around rounded-tl-md rounded-tr-md border border-b-0 bg-[#FDFDFD] px-4 py-2 dark:bg-[#0A0A0B]"
			>
				<div class=" flex flex-row">
					<label class="  flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="Basic"
							bind:group={selectedTab}
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
					<label class="mx-2 flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="Common"
							bind:group={selectedTab}
							checked={typeOfQuestion === 'Common'}
							onchange={changeTypes}
							class="sr-only"
						/>
						<span
							class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary"
						>
							<span
								class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'Common'
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-200 ease-in-out"
							></span>
						</span>
						Common
					</label>
				</div>
				<div class="flex flex-row">
					<label class="mx-2 flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="HealthCare"
							bind:group={selectedTab}
							checked={typeOfQuestion === 'HealthCare'}
							onchange={changeTypes}
							class="sr-only"
						/>
						<span
							class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary"
						>
							<span
								class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'HealthCare'
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-200 ease-in-out"
							></span>
						</span>
						Health Care
					</label>
					<label class="mx-2 flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="Financial"
							bind:group={selectedTab}
							checked={typeOfQuestion === 'Financial'}
							onchange={changeTypes}
							class="sr-only"
						/>
						<span
							class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary"
						>
							<span
								class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'Financial'
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-200 ease-in-out"
							></span>
						</span>
						Financial
					</label>
				</div>
			</div>
			<div
				class="scrollbar-hide overflow-y-auto rounded-bl-md rounded-br-md border bg-[#FDFDFD] py-4 dark:border-gray-400 dark:bg-[#0A0A0B] md:h-[50%] lg:h-[60%]"
			>
				<ul class="space-y-2 px-2">
					{#if typeOfQuestion === 'HealthCare' && selectedTab === 'HealthCare'}
						{#each HealthCarePlugins as card}
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
					{:else if typeOfQuestion === 'Basic' && selectedTab === 'Basic'}
						{#each BasicPlugins as card}
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
					{:else if typeOfQuestion === 'Common' && selectedTab === 'Common'}
						{#each CommonPlugins as card}
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
					{:else if typeOfQuestion === 'Financial' && selectedTab === 'Financial'}
						{#each FinancialPlugins as card}
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
		</div> -->

		<div class="px- bg-gren-100 h-full rounded-md">
			<!-- Button Grid: 2x2 -->
			<Card.Header class="bg-yellow-30 py-1">
				<div class="bg-re0 rounded-t-md border p-2">
					<div class="grid grid-cols-2 gap-2">
						{#each ['Basic', 'Common', 'HealthCare', 'Financial'] as type}
							<Button
								type="button"
								class="w-full  
						{selectedTab === type ? 'bg-primary' : 'bg-secondary'}"
								onclick={() => (selectedTab = type)}
							>
								{type === 'HealthCare' ? 'Health Care' : type}
							</Button>
						{/each}
					</div>
				</div>
			</Card.Header>
			<!-- Card List -->
			<Card.Content class="py-2">
				<div class="scrollbar-hide overflow-y-auto rounded-b-md border md:h-[50%] lg:h-[60%]">
					<ul class="space-y-2 px-2">
						{#each pluginMap[selectedTab] as card}
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
					</ul>
				</div>
			</Card.Content>
		</div>
	</Card.Root>
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
