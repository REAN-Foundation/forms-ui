import type { RequestEvent } from "@sveltejs/kit"
import { createMathematicalOperation, getMathematicalOperation } from "../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getMathematicalOperation(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting mathematical operations: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/mathematical-operation:', data);

    try {
        const response = await createMathematicalOperation(
            data.Name,
            data.Description,
            data.Operator,
            data.Operands
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the mathematical operation: ${err.message}`);
        return new Response(err.message);
    }
}; 