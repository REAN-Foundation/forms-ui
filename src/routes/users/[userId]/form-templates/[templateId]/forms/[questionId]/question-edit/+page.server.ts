import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { error, fail, redirect, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { getQuestionById, updateQuestion } from '../../../../../../../api/services/question';
import { questionSchema } from '$lib/components/forms/question-schema';
import chalk from 'chalk';

////////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    // const { userId } = event.params;
    event.depends('app:allNodes')
    try {
        const questionId = event.params.questionId;
        const response = await getQuestionById(questionId);
                // console.log(response);
                if (response.Status === 'failure' || response.HttpCode !== 200) {
                    throw error(response.HttpCode, response.Message);
                }
        
                const questionData = response.Data;
                const initialData={
                    id: questionData.id,
                    parentSectionId: questionData.ParentSectionId,
                    title: questionData.Title,
                    description: questionData.Description,
                    responseType: questionData.ResponseType,
                    score: questionData.Score,
                    correctAnswer: questionData.CorrectAnswer,
                    hint: questionData.Hint,
                    questionImageUrl: questionData.QuestionImageUrl,
                    rangeMin: questionData.RangeMin,
                    rangeMax: questionData.RangeMax,
                    options: questionData.Options
                }

        return {
            // sectionData,
            form: await superValidate(initialData, zod(questionSchema)),
            // message: response.Message
        };
    } catch (error) {
        console.error(`Error retriving assessment templates: ${error}`);
    }
};


export const actions = {
    createQuestion: async (event: RequestEvent) => {
        console.log('result is ');
        const userId = event.params.userId;
        const templateId = event.params.templateId;
        const form = await superValidate(event, zod(questionSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        let options = [];
        if (form.data.responseType === 'SingleChoiceSelection' || form.data.responseType === 'MultiChoiceSelection' || form.data.responseType === 'Boolean') {


            try {
                const parsedOptions = JSON.parse(form.data.options[0]);
                options = parsedOptions.map((option, index) => ({
                    Text: option.Text,
                    Sequence: option.Sequence || (index + 1).toString(),
                    ImageUrl: option.ImageUrl
                }));
            } catch (error) {
                console.error("Error parsing options:", error);
                return fail(400, { form, message: "Invalid options format" });
            }
            console.log("Reconstructed options:", JSON.stringify(options));
        }

        const response = await updateQuestion(
            form.data.id,
            form.data.title,
            form.data.description,
            form.data.responseType,
            form.data.score,
            form.data.correctAnswer,
            form.data.hint,
            form.data.questionImageUrl,
            form.data.rangeMin,
            form.data.rangeMax,
            options
        );

        console.log(chalk.hex('#6a329f')('Response from updation of Question', response));

        if (response.Status === 'failure' || response.HttpCode !== 200) {
            // toast.error('Question has not been created');
            throw redirect(303, `/users/${userId}/form-templates/${templateId}`);
        }

        // toast.success("Question added successfully!");
        throw redirect(303, `/users/${userId}/form-templates/${templateId}/forms`);
    },

};