import type { RequestEvent } from "@sveltejs/kit"
import { createLogicalOperation, getLogicalOperation } from "../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getLogicalOperation(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting logical operations: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/logical-operation:', data);

    try {
        const response = await createLogicalOperation(
            data.Name,
            data.Description,
            data.Operator,
            data.Operands
        );
        console.log('Response from createLogicalOperation:', response);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the logical operation: ${err.message}`);
        return new Response(err.message);
    }
}; 