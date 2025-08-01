import type { RequestEvent } from "@sveltejs/kit"
import { createValidationLogic, getValidationLogic } from "../../../services/logic";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getValidationLogic(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting validation logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/logic/validation-logic:', data);

    try {
        const response = await createValidationLogic(
            data.FieldId,
            data.Enabled
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the validation logic: ${err.message}`);
        return new Response(err.message);
    }
}; 