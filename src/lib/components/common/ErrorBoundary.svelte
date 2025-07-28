<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/components/toast/toast.store';
	import Icon from '@iconify/svelte';

	let { error = null, status = 500, route = page.url.pathname } = $props();
	let errorDetails = $state(false);

	function toggleErrorDetails() {
		errorDetails = !errorDetails;
	}

	function handleRetry() {
		window.location.reload();
	}

	function handleGoHome() {
		window.location.href = '/';
	}

	function copyErrorToClipboard() {
		if (error) {
			const errorText = `Error ${status} at ${route}\n${error.message}\n${error.stack || ''}`;
			navigator.clipboard.writeText(errorText).then(() => {
				addToast({
					message: 'Error details copied to clipboard',
					type: 'success',
					timeout: 3000
				});
			});
		}
	}
</script>

<main class="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
	<div class="flex items-center gap-2">
		<Icon icon="material-symbols:error" class="h-12 w-12 text-red-500" />
		<h1 class="text-4xl font-bold text-red-500">Error {status}</h1>
	</div>

	<p class="mt-4">
		At route:
		<span class="text-blue-600 underline">
			{route}
		</span>
	</p>

	<div class="mt-4 max-w-2xl rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
		<p class="text-lg text-red-700 dark:text-red-400">
			{error?.message || 'Something went wrong. Please try again later.'}
		</p>

		{#if error?.stack && !errorDetails}
			<button
				class="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
				onclick={toggleErrorDetails}
			>
				Show technical details
			</button>
		{/if}

		{#if errorDetails}
			<div class="mt-4 overflow-auto rounded bg-red-100 p-4 text-left dark:bg-red-950/50">
				<pre class="text-sm text-red-800 dark:text-red-300">{error?.stack}</pre>
				<button
					class="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
					onclick={toggleErrorDetails}
				>
					Hide technical details
				</button>
			</div>
		{/if}
	</div>

	<div class="mt-8 flex space-x-4">
		<Button variant="default" onclick={handleRetry}>
			<Icon icon="material-symbols:refresh" class="mr-2 h-4 w-4" />
			Retry
		</Button>
		<Button variant="outline" onclick={handleGoHome}>
			<Icon icon="material-symbols:home" class="mr-2 h-4 w-4" />
			Go Home
		</Button>
		<Button variant="secondary" onclick={copyErrorToClipboard}>
			<Icon icon="material-symbols:content-copy" class="mr-2 h-4 w-4" />
			Copy Error
		</Button>
	</div>
</main> 