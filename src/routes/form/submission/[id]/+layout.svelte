<script lang="ts">
	var systemName = 'Form Builder and sharing service';
	import Icon from '@iconify/svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { resetMode, setMode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	var systemName = 'Form Builder and sharing service';
</script>


<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="Form Service" />
</svelte:head>

<nav class="sticky top-0 z-10 flex h-11 items-center justify-between bg-gray-800 p-1 text-white">
	<div class="flex flex-row space-x-2 p-1">
		<img src="/favicon.png" alt="" class="h-5" />
		<p>z-Forms</p>
	</div>
	<div class="flex space-x-4">
		<div>
			<Button>
				<Icon icon="mdi:wrench-outline" width="16" height="16" />
			</Button>
		</div>
		<div>
			<Button>
				<Icon icon="ep:setting" width="16" height="16" />
			</Button>
		</div>
		<div>
			<Button>
				<Icon icon="iconoir:profile-circle" width="16" height="16" />
			</Button>
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" size="icon">
					<Icon
						icon="ph:sun-light"
						width="16"
						height="16"
						style="color: black"
						class=" h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>

					<Icon
						icon="ph:moon-light"
						width="16"
						height="16"
						style="color: white	"
						class="absolute  h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
				<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
				<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</nav>

<Toaster expand={true} richColors />
<slot></slot>
