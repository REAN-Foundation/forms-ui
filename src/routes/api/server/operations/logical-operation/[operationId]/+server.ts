import type { RequestEvent } from "@sveltejs/kit"
import { getLogicalOperationById, updateLogicalOperation, deleteLogicalOperation } from "../../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await getLogicalOperationById(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the logical operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const operationId = event.params.operationId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/logical-operation/[operationId]:', data);

    try {
        const response = await updateLogicalOperation(
            operationId,
            data.Name,
            data.Description,
            data.Operator,
            data.Operands
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the logical operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await deleteLogicalOperation(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the logical operation: ${err.message}`);
        return new Response(err.message);
    }
}; 