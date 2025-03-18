<script lang="ts">
	import { Template } from '$lib/index';
	import type { PageServerData } from './$types';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/state';

	//////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	const userId = page.params.userId;
	// $inspect(data)

	let sections = $state(data.assessmentTemplate.FormSections[0].Subsections);
	let templateInfo = $state(data.assessmentTemplate);
</script>

<div class="card container h-full w-full px-16 pt-4">
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
	<Template {templateInfo} {sections} />
</div>
