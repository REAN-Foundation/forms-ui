import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getFormTemplateDetails } from "../../../api/services/form-template";
import { getFormSubmission, searchFormSubmission } from "../../../api/services/submission";
import { searchquestionResponse } from "../../../api/services/question-response";

////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    console.log('Inside form submission LOAD..........');
    event.depends('app:allNodes')
    const submissionKey = event.params.id;
    console.log('Form submission id is ', submissionKey);

    if (!submissionKey) {
        error(400, 'Invalid submission link!');
    }

    const submissionRecord = await searchFormSubmission({
        encrypted: submissionKey
    });

    console.log('Submission record is ', submissionRecord);
    if (!submissionRecord && submissionRecord?.Status === 'failure' && submissionRecord?.HttpCode !== 200 ) {
        error(400, 'Invalid submission link!');
    }
    
    if (submissionRecord.Data?.RetrievedCount !== 1) {
        error(400, 'Invalid submission link!');
    }

    const submission = submissionRecord.Data?.Items[0];
    console.log('Submission record details ', submission);
    console.log('Template id ', submission.FormTemplateId);

    const submissionStatus = submission?.Status || 'LinkShared';

    const today = new Date();
    if (!submission.SubmittedAt && new Date(submission.ValidTill) < today) {
        error(410, 'Submission link has expired!');
    }
        
    const templateId = submission.FormTemplateId;

    const response = await getFormTemplateDetails(templateId);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        error(response.HttpCode, response.Message);
    }
    const assessmentTemplate = response.Data;

    console.log('Assessment template details ', assessmentTemplate);
    console.log('Submission status ', submissionStatus);
    let questionResponse = null;
    if (submissionStatus === 'LinkShared') {
        console.log('Submission is saved');
        questionResponse = await searchquestionResponse({ formSubmissionId: submission.Id });
        console.log('Question response ', questionResponse);
        questionResponse = questionResponse.Data?.Items || [];
    }

    return {
        assessmentTemplate,
        message: response.Message,
        questionResponse,
        submissionStatus
    };
   
};
