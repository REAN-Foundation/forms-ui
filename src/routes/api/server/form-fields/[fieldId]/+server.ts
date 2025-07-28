import { type RequestEvent } from '@sveltejs/kit';
import { deleteQuestion, getQuestionById } from '../../../services/form-field';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const questionId = event.params.questionId;

    try {
        const response = await getQuestionById(
            questionId,
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error fetching the form field: ${err}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        const questionId = event.params.questionId;
        console.log('Deleted form field id is:', questionId);
        const response = await deleteQuestion(questionId);
        console.log('Deleted form field response is:', response);
        return new Response(JSON.stringify(response));
    } catch (error) {
        console.error(`Error deleting the form field: ${error.message}`);
    }
}; 