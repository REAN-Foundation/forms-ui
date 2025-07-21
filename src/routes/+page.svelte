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

<div class="flex min-h-screen items-center justify-center">
	<div class="rounded shadow dark:border dark:bg-transparent ">
		<div>
			<Card.Root class="w-[350px]  rounded-xl ">
				<Card.Header>
					<Card.Title>Sign In</Card.Title>
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
							<div class="flex w-full max-w-sm flex-col">
								<Label for="username" class="mb-2 text-base">Username</Label>
								<Input
									type="text"
									placeholder="username"
									class="max-w-xs "
									name="username"
									required
								/>
								<div class=" relative my-4 flex w-full flex-col">
									<Label for="username" class="mb-2 text-base ">Password</Label>

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
											class="absolute right-4 top-11 cursor-pointer border-none bg-none"
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
						<Button class="w-full" type="submit" >Login</Button>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
