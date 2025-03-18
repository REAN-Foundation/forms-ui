<script>
	let { children } = $props();
</script>

<div class="flex h-screen flex-col bg-yello">
	<div class="fixed top-0 z-50 w-full bg-emerald-500">
		<!-- <Navbar /> -->
	</div>
	<div class="h-full overflow-y-auto bg-sl">
		{@render children()}
	</div>
</div>
