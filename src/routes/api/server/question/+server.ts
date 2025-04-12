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

        // Lookup object for supported responseTypes
        const SUPPORTED_RESPONSE_TYPES: Record<string, string> = {
            Height: 'Height (Centimeter)?',
            Weight: 'Body Weight (Kilograms)?',
            Temperature: 'Body Temperature (Fahrenheit)?',
            PulseRate: 'Heart Pulse Rate (in beats per minute)?',
            BloodPressure: 'Blood Pressure (in mmHg)?',
            Sleep: 'Sleep Duration (in hours)?',
            Glucose: 'Blood Glucose Level (mg/dL)?',
            Cholesterol: 'Cholesterol Level (mg/dL)?',
            BloodOxygenSaturation: 'Blood Oxygen Saturation (%)?',
            Lipoprotein: 'Lipoprotein Level (mg/dL)?',

            PhoneNumber: 'Enter your Phone number',
            Age: 'Enter your Age number',
            Email: 'Enter your Email number',
        };

        // Base model (always includes these fields)
        const model: any = {
            ParentTemplateId: data.parentFormTemplateId,
            ParentSectionId: data.parentSectionId,
            ResponseType: data.responseType
        };

        // Only add Title if responseType is supported
        if (SUPPORTED_RESPONSE_TYPES[data.responseType]) {
            model.Title = SUPPORTED_RESPONSE_TYPES[data.responseType];
        }

        const response = await createQuestion(model);
        return new Response(JSON.stringify(response));
    } catch (err) {
        const error = err as Error;
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

