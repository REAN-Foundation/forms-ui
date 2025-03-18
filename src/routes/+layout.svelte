<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { addToast } from '$lib/components/toast/toast.store';
	import Toasts from '$lib/components/toast/toasts.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import { page } from '$app/state';
	import { getFlash } from 'sveltekit-flash-message';

	///////////////////////////////////////////////////////////////////////////
	
	var systemName = 'Form Builder and sharing service';

	let { children } = $props();
	const flash = getFlash(page);

	flash.subscribe(($flash) => {
		if (!$flash) return;
		addToast({
			type: $flash.type || 'info',
			message: $flash.message,
			dismissible: true,
			timeout: 3000
		});
		flash.set(undefined);
	});
</script>

<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="Form Service" />
</svelte:head>

<!-- <Toaster closeButton richColors expand={true} position="top-center" /> -->
<Toasts />

<ModeWatcher />

<div class="flex h-screen flex-col bg-yello">
	<!-- <div class="fixed top-0 z-50 w-full bg-emerald-500"> -->
		<Navbar />
	<!-- </div> -->
	<div class="h-full overflow-y-auto bg-sl">
		{@render children()}
	</div>
</div>

