import type { RequestEvent } from '@sveltejs/kit';
import chalk from 'chalk';
import { createSubmission } from '../../services/submission';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const data = await event.request.json();
        console.log(chalk.hex('#00f0ff')('Received Data to create submission link:', data));

        const response = await createSubmission(data.FormTemplateId);
        console.log(chalk.hex('#00f000')('Received Response for Submission Link:', JSON.stringify(response)));

        return ResponseHandler.success(response);
    } catch (error) {
        return ResponseHandler.handleError(error);
    }
};


