import { json, type RequestEvent } from '@sveltejs/kit';
import { createQuestion, deleteQuestion, updateQuestion } from '../../services/question';
import { questionSchema } from '$lib/components/forms/question-schema';

//////////////////////////////////////////////////////////////
// interface CustomError extends Error {
//     statusCode?: number;
//     details?: string;
// }

export const POST = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Data from api/server/question POST:', data);

        const model = {
            ParentTemplateId: data.parentFormTemplateId,
            ParentSectionId: data.parentSectionId,
            ResponseType: data.responseType
        }

        if (data.responseType === 'Height') {
            model['Title'] = 'Height (Centimeter)?';
        }
        if (data.responseType === 'Weight') {
            model['Title'] = 'Body Weight (Kilograms)?';
        }
        if (data.responseType === 'Temperature') {
            model['Title'] = 'Body Temperature (Fahrenheit)?';
        }
        if (data.responseType === 'PulseRate') {
            model['Title'] = 'Heart Pulse Rate (in beats per minute)?';
        }
        if (data.responseType === 'BloodPressure') {
            model['Title'] = 'Blood Pressure (in mmHg)?';
        }
        const response = await createQuestion(model);

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

// export const questionSchema = z.object({
//     id: z.string().uuid(),
//     parentSectionId: z.string(),
//     title: z.string().min(80).max(256),
//     description: z.string().optional(),
//     responseType: z.string(),
//     score: zfd.numeric(z.number().default(0)).optional(),
//     correctAnswer: z.string().optional(),
//     hint: z.string().optional(),
//     questionImageUrl: z.string().optional(),
//     rangeMin: zfd.numeric(z.number()).optional(),
//     rangeMax: zfd.numeric(z.number()).optional(),
//     // options:z.array(z.object({
//     // 	Sequence: z.string(),
//     // 	Data: z.string(),
//     // 	ImageUrl: z.string().optional(),
//     // }))
//     options: z.array(z.string().optional()).optional()
// });

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/question:', data);

        const result = await questionSchema.safeParseAsync(data);
        if (!result.success) {
            return new Response(JSON.stringify({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            }));
        }
        const response = await updateQuestion(
            data.id,
            data.Title,
            data.Description,
            data.ResponseType,
            data.Score,
            data.CorrectAnswer,
            data.Hint,
            data.QuestionImageUrl,
            data.Options,
            data.RangeMin,
            data.RangeMax,
            data.IsRequired

        );
        return new Response(JSON.stringify(response))
    } catch (error) {
        console.error(`Error updating the section: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while updating the question.',
        }));
    }
};

