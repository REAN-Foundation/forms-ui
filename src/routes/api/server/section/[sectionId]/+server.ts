import { type RequestEvent } from '@sveltejs/kit';
import { getSectionById } from '../../../services/section';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const sectionId =  event.params.sectionId ;

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