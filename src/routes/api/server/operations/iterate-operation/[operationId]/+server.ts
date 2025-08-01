import type { RequestEvent } from "@sveltejs/kit"
import { getIterateOperationById, updateIterateOperation, deleteIterateOperation } from "../../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await getIterateOperationById(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the iterate operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const operationId = event.params.operationId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/iterate-operation/[operationId]:', data);

    try {
        const response = await updateIterateOperation(
            operationId,
            data.Name,
            data.Description,
            data.ItemAlias,
            data.OperationId,
            data.ArrayOperand
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the iterate operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await deleteIterateOperation(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the iterate operation: ${err.message}`);
        return new Response(err.message);
    }
}; 