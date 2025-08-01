import type { RequestEvent } from "@sveltejs/kit"
import { getCompositionOperationById, updateCompositionOperation, deleteCompositionOperation } from "../../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await getCompositionOperationById(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the composition operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const operationId = event.params.operationId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/composition-operation/[operationId]:', data);

    try {
        const response = await updateCompositionOperation(
            operationId,
            data.Name,
            data.Description,
            data.Operator,
            data.Children
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the composition operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await deleteCompositionOperation(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the composition operation: ${err.message}`);
        return new Response(err.message);
    }
}; 