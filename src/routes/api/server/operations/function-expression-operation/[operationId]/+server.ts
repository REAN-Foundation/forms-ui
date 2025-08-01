import type { RequestEvent } from "@sveltejs/kit"
import { getFunctionExpressionOperationById, updateFunctionExpressionOperation, deleteFunctionExpressionOperation } from "../../../../services/operations";

export const GET = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await getFunctionExpressionOperationById(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the function expression operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const operationId = event.params.operationId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/operations/function-expression-operation/[operationId]:', data);

    try {
        const response = await updateFunctionExpressionOperation(
            operationId,
            data.Name,
            data.Description,
            data.Expression,
            data.Variables
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the function expression operation: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const operationId = event.params.operationId;

    try {
        const response = await deleteFunctionExpressionOperation(operationId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the function expression operation: ${err.message}`);
        return new Response(err.message);
    }
}; 