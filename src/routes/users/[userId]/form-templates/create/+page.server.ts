import { assessmentSchema } from "$lib/components/template/assessment-schema.js";
import type { PageServerLoad } from "./$types.js";
import { superValidate } from "sveltekit-superforms";
// import { assessmentSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";
import { fail, type Actions, type RequestEvent } from "@sveltejs/kit";
import { createFormTemplate } from "../../../../api/services/form-template.js";
import { redirect } from 'sveltekit-flash-message/server';
import { successMessage } from "$lib/components/toast/message.utils.js";
/////////////////////////////////////////////////

export const load: PageServerLoad = async () => {

    const initialData = {
        defaultSectionNumbering: true
    };
    return {
        form: await superValidate(initialData, zod(assessmentSchema)),
    };
};

export const actions = {
    newAssessment: async (event: RequestEvent) => {

        const form = await superValidate(event, zod(assessmentSchema));
        if (!form.valid) {
            return fail(400, {
                form,
            });
        }
        // const request = event.request;
        const userId = event.params.userId

        const response = await createFormTemplate(
            form.data.title,
            form.data.description,
            form.data.currentVersion,
            form.data.tenantCode,
            form.data.itemsPerPage,
            form.data.type,
            userId,
            form.data.defaultSectionNumbering
        );

        const templateId = response.Data.id;

        if (response.Status === 'failure' || response.HttpCode !== 201) {
            throw redirect(
                303,
                `/users/${userId}/form-templates`,
            );
        }

        // throw redirect(
        //     303,
        //     `/users/${userId}/form-templates/${templateId}/forms`,

        // );
        throw redirect(
            303,
            `/users/${userId}/form-templates/${templateId}/forms`,
            successMessage(`Profile updated successfully!`),
            event
        );
    },
} satisfies Actions;