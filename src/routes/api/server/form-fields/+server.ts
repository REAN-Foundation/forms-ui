import { json, type RequestEvent } from '@sveltejs/kit';
import { createQuestion, deleteQuestion, updateQuestion } from '../../services/form-field';
import { questionSchema } from '$lib/components/forms/question-schema';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Data from api/server/form-fields POST:', data);

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
        const error = err as Error;
        console.error(`Error creating form field: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while creating the form field.',
        }));
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Form field ID from api/server/form-fields DELETE:', data.questionId);

        const response = await deleteQuestion(data.questionId);

        return json({
            status: 'success',
            message: response.message || 'Form field deleted successfully!',
        });
    } catch (err) {
        const error = err as Error;
        console.error(`Error deleting form field: ${error.message}`);

        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while deleting the form field.',
            },
            { status: 500 }
        );
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/form-fields:', data);

        const result = await questionSchema.safeParseAsync(data);
        console.log('result from api/server/form-fields PUT:', JSON.stringify(result, null, 2));
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
            data.IsRequired,
            data.ValidateLogicId,
            data.SkipLogicId,
            data.CalculateLogicId
        );
        return new Response(JSON.stringify(response))
    } catch (error) {
        console.error(`Error updating the form field: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while updating the form field.',
        }));
    }
}; 