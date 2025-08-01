import { type RequestEvent } from '@sveltejs/kit';
import { deleteValidationRule, getValidationRuleById, updateValidationRule } from '../../../../services/rule';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const ruleId = event.params.ruleId;

    try {
        const response = await getValidationRuleById(
            ruleId,
        );
        // console.log(response)
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error fetching the submission: ${err}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        const ruleId = event.params.ruleId;
        console.log('Deleted session id is :', ruleId);
        const response = await deleteValidationRule(ruleId);
        console.log('Deleted rule response is :', response);
        return new Response(JSON.stringify(response));

    } catch (error) {
        console.error(`Error deleting the rule: ${error.message}`);

    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/rule:', data);

        const response = await updateValidationRule(
            data.id,
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
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section updated successfully!',
        //     data: response,
        // });
        console.log(response);

        return new Response(JSON.stringify(response))
    } catch (err) {
        console.error(`Error updating the rule: ${err}`);
        return new Response(err);
    }
};
