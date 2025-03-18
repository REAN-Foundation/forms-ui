<script lang="ts">
	var systemName = 'Form Builder and sharing service';
	import Icon from '@iconify/svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { resetMode, setMode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	let { children } = $props();

	var systemName = 'Form Builder and sharing service';
</script>

<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="Form Service" />
</svelte:head>



<Toaster expand={true} richColors />
{@render children()}
