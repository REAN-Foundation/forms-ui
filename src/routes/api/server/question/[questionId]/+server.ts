import { json, type RequestEvent } from '@sveltejs/kit';
import { deleteQuestion, getQuestionById, updateQuestionsSequence } from '../../../services/question';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const questionId = event.params.questionId;

    try {
        const response = await getQuestionById(
            questionId,
        );
        // console.log(response)
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error fetching the submission: ${err}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        // const request = event.request;
        const questionId = event.params.questionId;
        console.log('Deleted question id is :', questionId);
        const response = await deleteQuestion(questionId);
        console.log('Deleted question response is :', response);
        return new Response(JSON.stringify(response));
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section deleted successfully!',
        //     data: response,
        // });
    } catch (error) {
        // const error = err as CustomError;
        console.error(`Error deleting the question: ${error.message}`);
        // return json(
        //     {
        //         status: 'error',
        //         message: error.message || 'An error occurred while deleting the section.',
        //         details: error.details || null,
        //     },
        //     { status: 500 }
        // );
    }
};



// Custom error type for extended error properties
interface CustomError extends Error {
    statusCode?: number;
    details?: string;
}

////////////////////////////////////////////////////////////////////////////////////

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/template:', data);

        const response = await updateQuestionsSequence(
            data.id,
            data.parentSectionId,
            data.sequence,

        );
        console.log(response);

        return new Response(JSON.stringify(response))
    } catch (err) {
        const error = err as CustomError;
        console.error(`Error updating the section: ${error.message}`);
        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while updating the section.',
                details: error.details || null,
            },
            { status: 500 }
        );
    }
};