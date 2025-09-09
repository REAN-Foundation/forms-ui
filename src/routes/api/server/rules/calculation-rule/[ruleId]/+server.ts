import type { RequestEvent } from "@sveltejs/kit"
import { getCalculationRuleById, updateCalculationRule, deleteCalculationRule } from "../../../../services/rule";

export const GET = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await getCalculationRuleById(ruleId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the calculation rule: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/calculation-rule/[ruleId]:', data);

    try {
        const response = await updateCalculationRule(
            ruleId,
            data.Name,
            data.Description,
            data.BaseOperationId,
            // data.Priority,
            // data.IsActive,
            data.OperationType,
            // data.ConditionForOperationId,
            data.OperationId,
            data.LogicId,
            data.Settings || {},
            data.RuleOutcome || {}
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the calculation rule: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await deleteCalculationRule(ruleId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the calculation rule: ${err.message}`);
        return new Response(err.message);
    }
}; 