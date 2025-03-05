<script lang="ts">
	import { Template } from '$lib/index';
	import type { PageServerData } from './$types';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/state';

	///////////////////////////////////////////////////////////////////////////////////
	const userId = page.params.userId;
	let { data }: { data: PageServerData } = $props();
	// export let data: PageServerData;

	let sections = $state(data.assessmentTemplate.RootSection);
	let templateInfo = $state(data.assessmentTemplate);

	// data.assessmentTemplate.RootSection.forEach((element) => {
	// 	// console.log(element.Sections)
	// 	element.Sections.forEach((element) => {
	// 		console.log("this is questions",element.Questions);

	// 		element.Sections.forEach(element => {
	// 			console.log("These are subsections",element.Questions);
	// 		});
	// 	});
	// });
	// console.log(templateInfo)
</script>

<div class="card container h-full w-full px-16 pt-4">
	<Breadcrumb.Root>
		<Breadcrumb.List class="flex">
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/users/{userId}/assessments">Assessment</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Question</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
	<Template {templateInfo} {sections} />
</div>
