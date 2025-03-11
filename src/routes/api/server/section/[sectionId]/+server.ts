import { type RequestEvent } from '@sveltejs/kit';
import { deleteSection, getSectionById } from '../../../services/section';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const sectionId = event.params.sectionId;

    try {
        const response = await getSectionById(
            sectionId,
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
        const sectionId = event.params.sectionId;
        console.log('Deleted session id is :', sectionId);
        const response = await deleteSection(sectionId);
        console.log('Deleted section response is :', response);
        return new Response(JSON.stringify(response));
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section deleted successfully!',
        //     data: response,
        // });
    } catch (error) {
        // const error = err as CustomError;
        console.error(`Error deleting the section: ${error.message}`);
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