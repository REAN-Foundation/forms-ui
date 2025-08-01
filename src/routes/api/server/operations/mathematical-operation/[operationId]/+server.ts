import type { RequestEvent } from "@sveltejs/kit"
import { getMathematicalOperationById, updateMathematicalOperation, deleteMathematicalOperation } from "../../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await getMathematicalOperationById(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the mathematical operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const operationId = event.params.operationId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/mathematical-operation/[operationId]:', data);

    try {
        const response = await updateMathematicalOperation(
            operationId,
            data.Name,
            data.Description,
            data.Operator,
            data.Operands
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the mathematical operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await deleteMathematicalOperation(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the mathematical operation: ${err.message}`);
        return new Response(err.message);
    }
}; 