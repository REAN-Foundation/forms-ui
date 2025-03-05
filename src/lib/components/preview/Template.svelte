<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Block from './Block.svelte';

	let { templateInfo, sections } = $props();
</script>

<div class="m-10 mx-auto w-full rounded-sm border-2 p-5">
	<!-- <div class=" "> -->
	<form action="?/response" method="post" class="">
		{#if templateInfo}
			<Card.Root>
				<div class="border-1 relative mx-auto h-fit rounded-md border pb-7 pt-5">
					<Card.Title class="absolute right-2 top-2 mr-0 mt-0 text-2xl font-semibold">
						{templateInfo.Type}
					</Card.Title>
					<div class="flex h-full flex-col items-center justify-center">
						<h2 class="mt-5 text-center text-3xl font-bold">
							{templateInfo.Title}
						</h2>
						<div class="mt-2 flex w-full flex-row justify-center">
							<Card.Description class="ml-auto text-sm">
								{templateInfo.Description || ''}
							</Card.Description>
							<p class="ml-auto mr-2 text-sm">
								Version: {templateInfo.CurrentVersion}
							</p>
						</div>
					</div>
				</div>
			</Card.Root>
		{/if}

		{#each sections ?? [] as s}
			{#if s?.Sections?.length > 0 || s?.Questions?.length > 0}
				<!-- <fieldset class="mt-2 border-2 p-2"> -->
				<!-- <legend class="mx-auto px-5">{s?.Title ?? 'Section Name'}</legend> -->

				{#each s?.Questions ?? [] as sq}
					<fieldset class="mt-2 border-2 p-2">
						<legend class="mx-auto px-5">{sq?.Title ?? 'Question Title'}</legend>
						<Block q={sq} />
					</fieldset>
				{/each}

				{#each s?.Sections ?? [] as ss}
					{#if ss?.Sections?.length > 0 && ss?.Questions?.length > 0}
						<fieldset class="mt-2 p-2">
							<legend class="mx-auto px-5">{ss?.Title ?? 'Section Name'}</legend>

							{#each ss?.Questions ?? [] as sq}
								<!-- <fieldset class="mt-2 border-2 p-2"> -->
								<!-- <legend class="mx-auto px-5">{sq?.Title ?? 'Question Title'}</legend> -->
								<Block q={sq} />
								<!-- </fieldset> -->
							{/each}

							{#each ss?.Sections ?? [] as sss}
								{#if sss?.Sections?.length > 0 || sss?.Questions?.length > 0}
									<fieldset class="mt-2 p-2">
										<legend class="mx-auto px-5">{sss?.Title ?? 'Subsection Name'}</legend>

										{#each sss?.Questions ?? [] as ssq}
											<!-- <fieldset class="mt-2 border-2 p-2"> -->
											<!-- <legend class="mx-auto px-5">{ssq?.Title ?? 'Question Title'}</legend> -->
											<Block q={ssq} />
											<!-- </fieldset> -->
										{/each}
									</fieldset>
								{/if}
							{/each}
						</fieldset>
					{/if}
				{/each}
				<!-- </fieldset> -->
			{/if}
		{/each}
	</form>
</div>
