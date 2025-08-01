import type { RequestEvent } from "@sveltejs/kit"
import { getCalculationLogicById, updateCalculationLogic, deleteCalculationLogic } from "../../../../services/logic";

export const GET = async (event: RequestEvent) => {
    const logicId = event.params.logicId;

    try {
        const response = await getCalculationLogicById(logicId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the calculation logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const logicId = event.params.logicId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/logic/calculation-logic/[logicId]:', data);

    try {
        const response = await updateCalculationLogic(
            logicId,
            data.FieldId,
            data.Enabled,
            data.FallbackValue
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the calculation logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const logicId = event.params.logicId;

    try {
        const response = await deleteCalculationLogic(logicId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the calculation logic: ${err.message}`);
        return new Response(err.message);
    }
}; 