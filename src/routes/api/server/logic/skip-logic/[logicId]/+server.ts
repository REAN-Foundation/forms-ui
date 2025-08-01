import type { RequestEvent } from "@sveltejs/kit"
import { getSkipLogicById, updateSkipLogic, deleteSkipLogic } from "../../../../services/logic";

export const GET = async (event: RequestEvent) => {
    const logicId = event.params.logicId;

    try {
        const response = await getSkipLogicById(logicId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting the skip logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const PUT = async (event: RequestEvent) => {
    const logicId = event.params.logicId;
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/logic/skip-logic/[logicId]:', data);

    try {
        const response = await updateSkipLogic(
            logicId,
            data.FieldId,
            data.Enabled,
            data.DefaultSkip
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error updating the skip logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const logicId = event.params.logicId;

    try {
        const response = await deleteSkipLogic(logicId);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting the skip logic: ${err.message}`);
        return new Response(err.message);
    }
}; 