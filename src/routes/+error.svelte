<script lang="ts">
	import { page } from '$app/state';
	import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';

	let { error = new Error('Unknown error'), status = 500 } = $props();
</script>

<ErrorBoundary {error} {status} route={page.url.pathname} />
