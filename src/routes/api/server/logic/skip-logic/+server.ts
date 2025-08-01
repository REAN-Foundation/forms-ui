import type { RequestEvent } from "@sveltejs/kit"
import { createSkipLogic, getSkipLogic } from "../../../services/logic";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getSkipLogic(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting skip logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/logic/skip-logic:', data);

    try {
        const response = await createSkipLogic(
            data.FieldId,
            data.Enabled,
            data.DefaultSkip
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the skip logic: ${err.message}`);
        return new Response(err.message);
    }
}; 