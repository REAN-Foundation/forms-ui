import type { RequestEvent } from "@sveltejs/kit"
import { getValidationLogicById, updateValidationLogic, deleteValidationLogic } from "../../../../services/logic";

export const GET = async (event: RequestEvent) => {
    const logicId = event.params.logicId;

    try {
        const response = await getValidationLogicById(logicId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the validation logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const logicId = event.params.logicId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/logic/validation-logic/[logicId]:', data);

    try {
        const response = await updateValidationLogic(
            logicId,
            data.FieldId,
            data.Enabled
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the validation logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const logicId = event.params.logicId;

    try {
        const response = await deleteValidationLogic(logicId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the validation logic: ${err.message}`);
        return new Response(err.message);
    }
}; 