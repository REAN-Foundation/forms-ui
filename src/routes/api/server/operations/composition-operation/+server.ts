import type { RequestEvent } from "@sveltejs/kit"
import { createCompositionOperation, getCompositionOperation } from "../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getCompositionOperation(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting composition operations: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/composition-operation:', data);

    try {
        const response = await createCompositionOperation(
            data.Name,
            data.Description,
            data.Operator,
            data.Children
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the composition operation: ${err.message}`);
        return new Response(err.message);
    }
}; 