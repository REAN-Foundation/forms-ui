import { json, type RequestEvent } from '@sveltejs/kit';
import { createQuestion, deleteQuestion, updateQuestion } from '../../services/question';

//////////////////////////////////////////////////////////////
interface CustomError extends Error {
    statusCode?: number;
    details?: string;
}

export const POST = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Data from api/server/question POST:', data);

        const response = await createQuestion(
            data.parentFormTemplateId,
            data.parentSectionId,
            data.responseType
        );

        console.log('Response from createQuestion:', response);
        return new Response(JSON.stringify(response));
    } catch (err) {
        const error = err as Error; // Ensures type safety for error
        console.error(`Error creating question: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while creating the question.',
        }));
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Question ID from api/server/question DELETE:', data.questionId);

        const response = await deleteQuestion(data.questionId);

        return json({
            status: 'success',
            message: response.message || 'Question deleted successfully!',
        });
    } catch (err) {
        const error = err as Error; // Ensures type safety for error
        console.error(`Error deleting question: ${error.message}`);

        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while deleting the question.',
            },
            { status: 500 }
        );
    }
};


export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/question:', data);

        const response = await updateQuestion(
            data.id,
            data.title,
            data.description,
            data.responseType,
            data.score,
            data.correctAnswer,
            data.hint,
            data.questionImageUrl,
            data.options

        );
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section updated successfully!',
        //     data: response,
        // });
        // console.log(response,"----------------------------------------------");

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

