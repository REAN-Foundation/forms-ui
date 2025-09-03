import type { RequestEvent } from "@sveltejs/kit"
import { createCalculationRule, getCalculationRule } from "../../../services/rule";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getCalculationRule(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting calculation rules: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/calculation-rule:', data);

    try {
        const response = await createCalculationRule(
            data.Name,
            data.Description,
            data.BaseOperationId,
            data.OperationType,
            data.OperationId,
            data.LogicId,
            data.Settings || {},
            data.RuleOutcome || {}
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the calculation rule: ${err.message}`);
        return new Response(err.message);
    }
}; 