import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {  getFormTemplatePreviewById } from "../../../../../api/services/form-template";

////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {

    event.depends('app:allNodes')
    try {
        const assessmentTemplateId = event.params.assessmentId;
        const response = await getFormTemplatePreviewById(assessmentTemplateId);

        if (response.Status === 'failure' || response.HttpCode !== 200) {
            throw error(response.HttpCode, response.Message);
        }

        const assessmentTemplate = response.Data;
        return {
            assessmentTemplateId,
            assessmentTemplate,
            message: response.Message
        };
    } catch (error) {
        console.error(`Error retriving assessment templates: ${error}`);
    }
}