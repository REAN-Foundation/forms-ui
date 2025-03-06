import { superValidate } from 'sveltekit-superforms';
import { getSectionById, updateSection } from '../../../../../../../api/services/section';
import type { PageServerLoad } from './$types';
// import { error } from '@sveltejs/kit';
import { error, fail, redirect, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { sectionSchema } from '$lib/components/forms/section-schema';

////////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    // const { userId } = event.params;
    event.depends('app:allNodes')
    try {
        const sectionId = event.params.sectionId;
        const response = await getSectionById(sectionId);
                // console.log(response);
                if (response.Status === 'failure' || response.HttpCode !== 200) {
                    throw error(response.HttpCode, response.Message);
                }
        
                const sectionData = response.Data;
                const initialData={
                    id: sectionData.id,
                    parentSectionId: sectionData.ParentSectionId,
                    title: sectionData.Title,
                    description: sectionData.Description,
                    sectionIdentifier: sectionData.SectionIdentifier
                }

        return {
            // sectionData,
            form: await superValidate(initialData, zod(sectionSchema)),
            // message: response.Message
        };
    } catch (error) {
        console.error(`Error retriving assessment templates: ${error}`);
    }
};


export const actions = {

    createSection: async (event: RequestEvent) => {
        console.log("We are in form action")
        // const request = event.request;
        const userId = event.params.userId;
        // const id = event.params.sectionId;
        const templateId = event.params.templateId;

        const form = await superValidate(event, zod(sectionSchema));
        if (!form.valid) {
            return fail(400, {
                form,
            });
        }
        console.log("This is form data", form.data);
        const response = await updateSection(
            // ParentTemplateId,
            form.data.id,
            form.data.parentSectionId,
            form.data.title,
            form.data.description,
            form.data.sectionIdentifier,
            // form.data.sequence
        );
        // console.log(chalk.hex('#09FA25')("this is from server", JSON.stringify(response), "page.server.ts file"));

        if (response.Status === 'failure' || response.HttpCode !== 200) {
            throw redirect(303, `preview`);
        }
        throw redirect(303, `/users/${userId}/form-templates/${templateId}/forms`,);
    }
};