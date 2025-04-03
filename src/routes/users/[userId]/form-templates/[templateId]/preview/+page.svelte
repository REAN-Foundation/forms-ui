<script lang="ts">
	import { Template } from '$lib/index';
	import type { PageServerData } from './$types';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card/index.js';
	import { cleanAssessmentTemplate } from '$lib/utils';
	//////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	const userId = page.params.userId;
	// $inspect(data)

	let section = $state(data.assessmentTemplate.FormSections[0].Subsections);
	let templateInfo = $state(data.assessmentTemplate);
	let sections = cleanAssessmentTemplate(section);
</script>

<div class="card container my-12 h-full w-full px-6 pt-4 md:px-5">
	<Breadcrumb.Root>
		<Breadcrumb.List class="flex">
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/users/{userId}/form-templates">Form Template</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Form</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div
		class="mx-auto my-10 w-full rounded-md border border-gray-400 p-5 dark:bg-[#0a0a0b] md:w-3/4"
	>
		{#if templateInfo}
			<Card.Root>

				<div
					class=" relative mx-auto h-fit rounded-md border border-gray-400 py-4 dark:bg-[#0a0a0b]"
				>
					<!-- <p class="absolute right-4 top-2 mr-0 mt-0 leading-7 [&:not(:first-child)]:mt-6">
								{templateInfo.Type}
							</p> -->
					<div class="flex h-full flex-col items-center justify-center">
						<h2 class="text-center text-2xl font-bold capitalize">
							{templateInfo.Title}
						</h2>
						<div class="relative w-full p-4">
							<div class="flex w-full justify-center text-center text-gray-700">
								<Card.Description>
									{templateInfo.Description || ''}
								</Card.Description>
							</div>
							<span class="absolute mx-4 right-0 top-1/2 -translate-y-1/2 text-sm text-gray-700">
								Version: {templateInfo.CurrentVersion}
							</span>
						</div>
					</div>
				</div>
			</Card.Root>
		{/if}
		<Template {sections} />
	</div>
</div>
