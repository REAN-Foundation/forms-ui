import { json, type RequestEvent } from '@sveltejs/kit';
import chalk from 'chalk';
import { createQuestionResponse } from '../../services/question-response';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log(chalk.hex('#00f0ff')('Incoming request data:', JSON.stringify(data)));

        const response = await createQuestionResponse(
            data.FormSubmissionId,
            data.Data
        );

        console.log(chalk.hex('#00f000')('Response from createQuestionResponse:', JSON.stringify(response)));

        return json({
            status: 'success',
            message: 'Question response created successfully!',
            data: response,
        });
    } catch (err) {
        const error = err as Error; // Ensures type safety for error handling
        console.error(chalk.hex('#ff0000')(`Error creating question response: ${error.message}`));

        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while creating the question response.',
            },
            { status: 500 } // Set appropriate status code for server error
        );
    }
};
