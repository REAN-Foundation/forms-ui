<script lang="ts">
	import { number } from 'zod';
	import { draggable } from './dnd';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	// import * as Tabs from '$lib/components/ui/tabs/index.js';
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
	let selectedTab = $state('Basic');
	// export let cards;
	// export let measurements;
	// export let typeOfQuestion;
	// export let changeTypes;
	let { basicCards, healthCarePlugins, typeOfQuestion, changeTypes, isOpen } = $props();
</script>

<!-- sidebar add section -->
<div class="relative h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden {isOpen ? 'block' : 'hidden'} md:block">
	<!-- <div class="sticky h-screen space-y-4 bg-[#F6F8FA] px-4 py-6 dark:bg-[#0A0A0B] md:fixed"> -->
	<Card.Root
		class="!rounded-none !border-none px-4 py-5 !shadow-none md:w-full"
	>
		<Card.Title class="text-md mb-3">Drag Section From Here</Card.Title>
		<div
			class="flex cursor-grab items-center justify-center"
			use:draggable={{ ...SectionTemplate, type: 'section' }}
			role="button"
			aria-label="Draggable new section template"
		>
			<Button
				class=" space-x-2 rounded-md border dark:border-gray-400 md:w-full"
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
	<Card.Root
		class="!rounded-none !border-none !shadow-none md:w-full md:px-2 2xl:w-full"
	>
		<Card.Title class="text-md px-3">Question</Card.Title>
		<div class="rounded-md px-3 dark:border-gray-400">
			<div
                class="flex flex-wrap justify-around py-2 px-4 rounded-tl-md rounded-tr-md border border-b-0"
            >
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
            </div>
			<div
				class="custom-scrollbar overflow-y-auto rounded-bl-md rounded-br-md border py-4"
			>
				<ul class="space-y-2 px-2">
					{#if typeOfQuestion === 'HealthCare' && selectedTab === 'HealthCare'}
						{#each healthCarePlugins as card}
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
						{#each basicCards as card}
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
		</div>
	</Card.Root>
	<!-- sidebar question response time -->
	<!-- <Card.Root class="h-1/2 rounded-lg !border-none bg-[#F6F8FA] px-4 !shadow-none ">
            <Card.Title class="text-md  ">Question Response Types</Card.Title>
            <div class="scrollbar-hide border bg-[#F6F8FA] my-3 dark:bg-[#0A0A0B] h-full overflow-y-auto py-4">
                <ul class="space-y-2">
                    {#if typeOfQuestion === 'Advanced' && selectedTab==='Advanced'}
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
                    {:else if typeOfQuestion === 'Basic' && selectedTab==='Basic'}
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
        </Card.Root> -->
	<!-- </div> -->
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
	.custom-scrollbar::-webkit-scrollbar {
		width: 2px;
		height: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #d70c0c;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
