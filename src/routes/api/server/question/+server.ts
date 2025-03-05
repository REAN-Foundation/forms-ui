import { json, type RequestEvent } from '@sveltejs/kit';
import { createQuestion, deleteQuestion } from '../../services/question';

//////////////////////////////////////////////////////////////

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
        return json({
            status: 'success',
            message: response.message || 'Question created successfully!',
            data: response,
        });
    } catch (err) {
        const error = err as Error; // Ensures type safety for error
        console.error(`Error creating question: ${error.message}`);

        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while creating the question.',
            },
            { status: 500 }
        );
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
