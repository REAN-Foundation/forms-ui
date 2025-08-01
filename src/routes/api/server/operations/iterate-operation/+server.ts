import type { RequestEvent } from "@sveltejs/kit"
import { createIterateOperation, getIterateOperation } from "../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getIterateOperation(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting iterate operations: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/iterate-operation:', data);

    try {
        const response = await createIterateOperation(
            data.Name,
            data.Description,
            data.ItemAlias,
            data.OperationId,
            data.ArrayOperand
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the iterate operation: ${err.message}`);
        return new Response(err.message);
    }
}; 