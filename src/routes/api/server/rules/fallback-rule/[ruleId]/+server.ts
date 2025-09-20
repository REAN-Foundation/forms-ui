import type { RequestEvent } from "@sveltejs/kit"
import { getFallbackRuleById, updateFallbackRule, deleteFallbackRule } from "../../../../services/rule";

export const GET = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await getFallbackRuleById(ruleId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the fallback rule: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/fallback-rule/[ruleId]:', data);

    try {
        const response = await updateFallbackRule(
            ruleId,
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
        console.error(`Error updating the fallback rule: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await deleteFallbackRule(ruleId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the fallback rule: ${err.message}`);
        return new Response(err.message);
    }
};