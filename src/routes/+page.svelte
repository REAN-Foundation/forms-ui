<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import Icon from '@iconify/svelte';
	import { toast } from 'svelte-sonner';

	let password = '';
	let showPassword = false;

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		// toast.success('Logged in successful');
	}
</script>

<div class="container mx-auto p-8">
	<div class="rounded bg-gray-100 p-8 shadow dark:border dark:bg-transparent">
		<div class="mb-6">
			<img src="" alt="" class="mx-auto" height="34" width="34" />
			<h1 class=" text-center text-xl font-bold">zForms</h1>
		</div>
		<div class="mx-auto flex items-center justify-center">
			<Card.Root class="w-[350px] rounded-xl">
				<Card.Header>
					<Card.Title>Sign in</Card.Title>
				</Card.Header>
				<Card.Content>
					<form
						method="post"
						action="?/login"
						class="rounded-lg"
						use:enhance
						onsubmit={handleSubmit}
					>
						<div class="grid w-full items-center gap-4">
							<div class="flex w-full max-w-sm flex-col gap-1.5">
								<Label for="username">Username</Label>
								<Input
									type="text"
									placeholder="username"
									class="max-w-xs"
									name="username"
									required
								/>
								<div class="relative my-4 flex items-center">
									{#if showPassword}
										<Input
											type="text"
											name="password"
											bind:value={password}
											placeholder="password"
											required
											class="input max-w-xs"
										/>
									{:else}
										<Input
											type="password"
											name="password"
											bind:value={password}
											placeholder="password"
											required
											class="input max-w-xs"
										/>
									{/if}
									{#if password !== ''}
										<button
											type="button"
											class="absolute right-4 cursor-pointer border-none bg-none"
											onclick={togglePasswordVisibility}
										>
											<Icon
												icon={showPassword
													? 'material-symbols:visibility-outline'
													: 'material-symbols:visibility-off-outline'}
												class="text-lg"
											/>
										</button>
									{/if}
								</div>
							</div>
						</div>
						<Button class="w-full " type="submit">Login</Button>
					</form>
				</Card.Content>
				<Card.Footer></Card.Footer>
			</Card.Root>
		</div>
	</div>
</div>
