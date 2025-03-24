import { type RequestEvent } from '@sveltejs/kit';
import { createSection, deleteSection, updateSection } from '../../services/section';
import { json } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////////////////////

// Custom error type for extended error properties
interface CustomError extends Error {
    statusCode?: number;
    details?: string;
}

// export const POST = async (event: RequestEvent) => {
//     try {
//         const request = event.request;
//         const data = await request.json();

//         console.log('data from api/server/section:', data);

//         const response = await createSection(data.parentFormTemplateId, data.parentSectionId);
//         return json({
//             status: 'success',
//             message: response.message || 'Section created successfully!',
//             data: response,
//         });
//     } catch (err) {
//         const error = err as CustomError;
//         console.error(`Error creating the section: ${error.message}`);
//         return json(
//             {
//                 status: 'error',
//                 message: error.message || 'An error occurred while creating the section.',
//                 details: error.details || null,
//             },
//             { status: 500 }
//         );
//     }
// };
export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/section:', data);

    try {
        const response = await createSection(
            data.parentFormTemplateId,
            data.parentSectionId
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error fetching the submission: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/section:', data);

        const response = await updateSection(
            data.id,
            data.ParentSectionId,
            data.Title,
            data.Description,
            data.SectionIdentifier
        );
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section updated successfully!',
        //     data: response,
        // });
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

export const DELETE = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        const response = await deleteSection(data.sectionId);

        return json({
            status: 'success',
            message: response.message || 'Section deleted successfully!',
            data: response,
        });
    } catch (err) {
        const error = err as CustomError;
        console.error(`Error deleting the section: ${error.message}`);
        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while deleting the section.',
                details: error.details || null,
            },
            { status: 500 }
        );
    }
};
