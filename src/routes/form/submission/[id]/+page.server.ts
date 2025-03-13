import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getFormTemplateDetails } from "../../../api/services/form-template";
import { getFormSubmission } from "../../../api/services/submission";

////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {

    event.depends('app:allNodes')
    const submissionId = event.params.id;
    try {
        const submission = await getFormSubmission(submissionId);
        // console.log(submission.Data.ParentFormTemplate.id, "this is submission");

        const templateId = submission.Data.ParentFormTemplate.id
        const response = await getFormTemplateDetails(templateId);
        // console.log(response, "this is template");

        if (response.Status === 'failure' || response.HttpCode !== 200) {
            throw error(response.HttpCode, response.Message);
        }

        const assessmentTemplate = response.Data;
        return {
            assessmentTemplate,
            message: response.Message
        };
    } catch (error) {
        console.error(`Error retriving assessment templates: ${error}`);
    }
};