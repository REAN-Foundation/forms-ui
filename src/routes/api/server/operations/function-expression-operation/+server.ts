import type { RequestEvent } from "@sveltejs/kit"
import { createFunctionExpressionOperation, getFunctionExpressionOperation } from "../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getFunctionExpressionOperation(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting function expression operations: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/function-expression-operation:', data);

    try {
        const response = await createFunctionExpressionOperation(
            data.Name,
            data.Description,
            data.Expression,
            data.Variables
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the function expression operation: ${err.message}`);
        return new Response(err.message);
    }
}; 