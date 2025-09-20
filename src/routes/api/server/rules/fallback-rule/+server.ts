import type { RequestEvent } from "@sveltejs/kit"
import { getFallbackRule, createFallbackRule } from "../../../services/rule";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getFallbackRule(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting fallback rules: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/fallback-rule:', data);

    try {
        const response = await createFallbackRule(
            data.Name,
            data.Description,
            data.Priority,
            data.IsActive,
            data.OperationType,
            data.BaseOperationId,
            data.Action,
            data.ActionValue,
            data.ActionMessage,
            data.ActionParameters,
            data.ExecutionOrder,
            data.StopOnSuccess
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the fallback rule: ${err.message}`);
        return new Response(err.message);
    }
};