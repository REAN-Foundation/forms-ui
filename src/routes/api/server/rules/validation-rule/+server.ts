import type { RequestEvent } from "@sveltejs/kit"
import { createValidationRule } from "../../../services/rule";


export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/rule:', data);

    try {
        const response = await createValidationRule(
            data.Name,
            data.Description,
            data.Priority,
            data.IsActive,
            data.OperationType,
            data.OperationId,
            data.ErrorWhenFalse,
            data.ErrorMessage,
            data.LogicId
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the rule: ${err.message}`);
        return new Response(err.message);
    }
};