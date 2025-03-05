<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	// import { Toaster } from '$lib/components/ui/sonner';
	import Navbar from '$lib/components/common/Navbar.svelte';
	
	var systemName = 'Form Builder and sharing service';

	let { children } = $props();
</script>

<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="Form Service" />
</svelte:head>

<!-- <Toaster closeButton richColors expand={true} position="top-center" /> -->

<ModeWatcher />

<div class="flex h-screen flex-col bg-yello">
	<!-- <div class="fixed top-0 z-50 w-full bg-emerald-500"> -->
		<Navbar />
	<!-- </div> -->
	<div class="h-full overflow-y-auto bg-sl">
		{@render children()}
	</div>
</div>

