import { type Actions, type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createFormTemplate, getFormTemplateById } from '../../../api/services/form-template';
import { superValidate } from "sveltekit-superforms";

// import { superValidate } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { assessmentSchema } from '$lib/components/template/assessment-schema';
import { redirect } from 'sveltekit-flash-message/server';
import { successMessage } from "$lib/components/toast/message.utils.js";

////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const { userId } = event.params;
	event.depends('app:assessmentTemplate');

	try {
		const ownerUserId = userId;
		const response = await getFormTemplateById({ ownerUserId });

		const assessmentTemplate = response?.Data?.Items ?? [];

		// const initialData = {
		// 	defaultSectionNumbering: true
		// };
		return {
			assessmentTemplate,
			message: response.Message,
			// form: await superValidate(initialData, zod(assessmentSchema)),
			form: await superValidate(zod(assessmentSchema)),
		};

	} catch (error) {
		console.error(`Error retrieving assessment templates: ${error}`);

		return {
			assessmentTemplate: [],
			message: 'Failed to load assessment templates.',
			form: await superValidate(zod(assessmentSchema)),
		};
	}
};


export const actions = {
	newAssessment: async (event: RequestEvent) => {
		// const request = event.request;
		// const data = await request.formData();

		// console.log(Object.fromEntries(data));
		// console.log(data)
		const form = await superValidate(event, zod(assessmentSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}
		// const request = event.request;
		const userId = event.params.userId

		const response = await createFormTemplate(
			form.data.Title,
			form.data.Description,
			form.data.CurrentVersion,
			form.data.TenantCode,
			form.data.ItemsPerPage,
			form.data.Type,
			userId,
			form.data.DefaultSectionNumbering
		);

		const templateId = response.Data.id;

		if (response.Status === 'failure' || response.HttpCode !== 201) {
			throw redirect(
				303,
				`/users/${userId}/form-templates`,
			);
		}

		throw redirect(
			303,
			`/users/${userId}/form-templates/${templateId}/forms`,
			successMessage(`Form template created successfully!`),
			event
		);
	},
} satisfies Actions;


