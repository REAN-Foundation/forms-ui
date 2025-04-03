<script lang="ts">
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	// import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	// import * as Tabs from '$lib/components/ui/tabs';
	import Icon from '@iconify/svelte';
	// import * as Tooltip from '$lib/components/ui/tooltip';
	import { onMount } from 'svelte';

	const profileRadioValue = 'benoit';
	let bookmarks = false;
	let fullUrls = true;

	let dropdownOpen = false;
	let currentThemeMode = 'light';
	let currentColor = 'theme-light-blue';
	let isDark = false;

	// const themeModes = ['light', 'dark', 'system'];
	const themeModes = ['light', 'dark'];
	const lightColors = [
		{ name: 'Gray', value: 'theme-light-gray', colorClass: 'bg-gray-300' },
		{ name: 'Rose', value: 'theme-light-rose', colorClass: 'bg-rose-300' },
		{ name: 'Green', value: 'theme-light-green', colorClass: 'bg-green-300' },
		{ name: 'Orange', value: 'theme-light-orange', colorClass: 'bg-orange-300' },
		{ name: 'Blue', value: 'theme-light-blue', colorClass: 'bg-blue-300' }
	];
	const darkColors = [
		{ name: 'Gray', value: 'theme-dark-gray', colorClass: 'bg-gray-700' },
		{ name: 'Rose', value: 'theme-dark-rose', colorClass: 'bg-rose-700' },
		{ name: 'Green', value: 'theme-dark-green', colorClass: 'bg-green-700' },
		{ name: 'Orange', value: 'theme-dark-orange', colorClass: 'bg-orange-700' },
		{ name: 'Blue', value: 'theme-dark-blue', colorClass: 'bg-blue-700' }
	];

	function toggleDropdown(event: Event) {
		event.stopPropagation();
		dropdownOpen = !dropdownOpen;
	}

	function handleThemeModeSelection(event: Event, mode: string) {
		event.preventDefault();
		event.stopPropagation();
		currentThemeMode = mode;

		// Immediately update dark mode state
		isDark = mode === 'dark';

		// Apply theme changes
		if (isDark) {
			document.documentElement.classList.add('dark');
			document.documentElement.classList.remove('light');
			// Switch to dark color variant
			const darkVariant = currentColor.replace('light', 'dark');
			handleColorSelection(darkVariant);
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.classList.add('light');
			// Switch to light color variant
			const lightVariant = currentColor.replace('dark', 'light');
			handleColorSelection(lightVariant);
		}

		localStorage.setItem('theme-mode', mode);
	}

	function handleColorSelection(color: string) {
		currentColor = color;
		localStorage.setItem('theme-color', color);
		document.documentElement.setAttribute('data-theme', color);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown')) {
			dropdownOpen = false;
		}
	}

	onMount(() => {
		// Initialize theme from localStorage or default to light
		const savedTheme = localStorage.getItem('theme-mode') || 'light';
		const savedColor = localStorage.getItem('theme-color') || currentColor;

		// Set initial theme
		isDark = savedTheme === 'dark';
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.add('light');
		}

		currentThemeMode = savedTheme;
		handleColorSelection(savedColor);

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<nav class="fixed w-full z-10 flex items-center justify-between border border-t-0 bg-[#F6F8FA] p-1">
	<!-- <div class="fixed flex space-x-4 lg:space-x-6"> -->
	<div class="left-0">
		<!-- <Menubar.Menu>
				<Menubar.Trigger>File</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>
						New Tab <Menubar.Shortcut>⌘T</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item>
						New Window <Menubar.Shortcut>⌘N</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item>New Incognito Window</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>Share</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.Item>Email link</Menubar.Item>
							<Menubar.Item>Messages</Menubar.Item>
							<Menubar.Item>Notes</Menubar.Item>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Separator />
					<Menubar.Item>
						Print... <Menubar.Shortcut>⌘P</Menubar.Shortcut>
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Edit</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>
						Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item>
						Redo <Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>Find</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.Item>Search the web</Menubar.Item>
							<Menubar.Separator />
							<Menubar.Item>Find...</Menubar.Item>
							<Menubar.Item>Find Next</Menubar.Item>
							<Menubar.Item>Find Previous</Menubar.Item>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Separator />
					<Menubar.Item>Cut</Menubar.Item>
					<Menubar.Item>Copy</Menubar.Item>
					<Menubar.Item>Paste</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Notifications</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.CheckboxItem bind:checked={bookmarks}
						>Always Show Bookmarks Bar</Menubar.CheckboxItem
					>
					<Menubar.CheckboxItem bind:checked={fullUrls}>Always Show Full URLs</Menubar.CheckboxItem>
					<Menubar.Separator />
					<Menubar.Item inset>
						Reload <Menubar.Shortcut>⌘R</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item inset>
						Force Reload <Menubar.Shortcut>⇧⌘R</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item inset>Toggle Fullscreen</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item inset>Hide Sidebar</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Subscription</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.RadioGroup value={profileRadioValue}>
						<Menubar.RadioItem value="andy">Andy</Menubar.RadioItem>
						<Menubar.RadioItem value="benoit">Benoit</Menubar.RadioItem>
						<Menubar.RadioItem value="Luis">Luis</Menubar.RadioItem>
					</Menubar.RadioGroup>
					<Menubar.Separator />
					<Menubar.Item inset>Edit...</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item inset>Add Profile...</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu> -->
	</div>
	<!-- </div> -->

	<div class="mr-3">
		<div class="relative inline-block">
			<Button onclick={toggleDropdown} variant="outline" size="icon">
				<Icon
					icon="iconoir:sun-light"
					width="16"
					height="16"
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>

				<Icon
					icon="ri:moon-line"
					width="16"
					height="16"
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>

				<span class="sr-only">Toggle theme</span>
			</Button>
			<!-- <Button onclick={toggleDropdown} variant="outline" size="icon">
				<Icon
					icon="ri:moon-line"
					width="16"
					height="16"
					class=" h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>

				<Icon
					icon="iconoir:sun-light"
					width="16"
					height="16"
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
			</Button> -->

			{#if dropdownOpen}
				<div
					class="dropdown absolute right-0 z-50 mr-2 mt-2 w-72 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800 dark:text-white"
				>
					<div class="mb-2 text-lg font-semibold">Themes</div>
					<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
						Customize your workspace by changing the appearance and theme color.
					</p>

					<div
						class="mb-4 flex items-center justify-center space-x-2 rounded-md bg-gray-100 p-1 dark:bg-gray-700"
					>
						{#each themeModes as mode}
							<Button
								variant="ghost"
								onclick={(event) => handleThemeModeSelection(event, mode)}
								class={`w-1/2 rounded-md py-2 text-sm font-semibold transition-colors ${
									currentThemeMode === mode
										? 'bg-primary text-white'
										: ' hover:bg-secondary  dark:hover:bg-secondary'
								}`}
							>
								<span class="ml-2">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
							</Button>
						{/each}
					</div>

					<div class="mb-2 text-sm font-semibold">
						{currentThemeMode.charAt(0).toUpperCase() + currentThemeMode.slice(1)} Theme Colors
					</div>

					<div class="grid grid-cols-3 gap-2">
						{#each isDark ? darkColors : lightColors as { name, value, colorClass }}
							<Button
								onclick={() => handleColorSelection(value)}
								class={`flex h-10 items-center justify-center rounded-md ${colorClass} ${
									currentColor === value ? 'border-2 border-blue-500' : ''
								}`}
							>
								<span class="sr-only">{name}</span>

								{#if currentColor === value}
									<Icon icon="lucide:check" class="ml-1 h-4 w-4 text-white" />
								{/if}
								<p class="text-white dark:text-white">{name}</p>
							</Button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</nav>

<!-- 
<script>
		let currentThemeMode = 'system';
	let currentColor = '';

	function handleThemeModeSelection(event, mode) {
		event.preventDefault();
		event.stopPropagation();

		if (mode === 'system') {
			resetMode();
		} else {
			setMode(mode);
		}
		currentThemeMode = mode;
	}

	function handleColorSelection(color) {
		currentColor = color;
		document.documentElement.setAttribute('data-theme', color);

		document.querySelector('body').click();
	}

	Function to handle theme mode selection

</script> -->

<!-- <DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button builders={[builder]} variant="outline" size="icon">
				
							<Icon
								icon="iconoir:sun-light"
								width="16"
								height="16"
								class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
							/>

							<Icon
								icon="ri:moon-line"
								width="16"
								height="16"
								class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
							/>

							<span class="sr-only">Toggle theme</span>
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Themes</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</DropdownMenu.Trigger>

			<DropdownMenu.Content align="end">
				
				<DropdownMenu.Label>Choose Mode</DropdownMenu.Label>
				<DropdownMenu.Item onclick={(event) => handleThemeModeSelection(event, 'light')}
					>Light Mode</DropdownMenu.Item
				>
				<DropdownMenu.Item onclick={(event) => handleThemeModeSelection(event, 'dark')}
					>Dark Mode</DropdownMenu.Item
				>
				<DropdownMenu.Item onclick={(event) => handleThemeModeSelection(event, 'system')}
					>System Default</DropdownMenu.Item
				>

				<DropdownMenu.Separator />

	
				{#if currentThemeMode === 'light'}
					<DropdownMenu.Label>Light Theme Colors</DropdownMenu.Label>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-light-gray')}
						>Gray (Light)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-light-rose')}
						>Rose (Light)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-light-green')}
						>Green (Light)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-light-orange')}
						>Orange (Light)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-light-blue')}
						>Blue (Light)</DropdownMenu.Item
					>
				{/if}


				{#if currentThemeMode === 'dark'}
					<DropdownMenu.Label>Dark Theme Colors</DropdownMenu.Label>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-dark-gray')}
						>Gray (Dark)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-dark-rose')}
						>Rose (Dark)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-dark-green')}
						>Green (Dark)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-dark-orange')}
						>Orange (Dark)</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => handleColorSelection('theme-dark-blue')}
						>Blue (Dark)</DropdownMenu.Item
					>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root> -->

<!-- <style>
	html.light {
		--bg-color: #ffffff;
		--text-color: #000000;
	}
	html.dark {
		--bg-color: #1a202c;
		--text-color: #ffffff;
	}
</style> -->
