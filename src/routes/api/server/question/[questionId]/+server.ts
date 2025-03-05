import { type RequestEvent } from '@sveltejs/kit';
import { getQuestionById } from '../../../services/question';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const questionId =  event.params.questionId ;

    try {
        const response = await getQuestionById(
            questionId,
        );
        // console.log(response)
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error fetching the submission: ${err}`);
        return new Response(err.message);
    }
};