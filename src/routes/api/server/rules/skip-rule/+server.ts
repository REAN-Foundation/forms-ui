import type { RequestEvent } from "@sveltejs/kit"
import { createSkipRule, getSkipRule } from "../../../services/rule";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getSkipRule(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting skip rules: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/skip-rule:', data);

    try {
        const response = await createSkipRule(
            data.Name,
            data.Description,
            data.Priority,
            data.IsActive,
            data.OperationType,
            data.OperationId,
            data.SkipWhenTrue,
            data.LogicId
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the skip rule: ${err.message}`);
        return new Response(err.message);
    }
}; 