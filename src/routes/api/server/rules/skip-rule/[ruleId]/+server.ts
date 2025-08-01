import type { RequestEvent } from "@sveltejs/kit"
import { getSkipRuleById, updateSkipRule, deleteSkipRule } from "../../../../services/rule";

export const GET = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await getSkipRuleById(ruleId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the skip rule: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/skip-rule/[ruleId]:', data);

    try {
        const response = await updateSkipRule(
            ruleId,
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
        console.error(`Error updating the skip rule: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await deleteSkipRule(ruleId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the skip rule: ${err.message}`);
        return new Response(err.message);
    }
}; 