import type { RequestEvent } from "@sveltejs/kit"
import { createCalculationLogic, getCalculationLogic } from "../../../services/logic";

export const GET = async (event: RequestEvent) => {
    const url = new URL(event.request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
        const response = await getCalculationLogic(searchParams);
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error getting calculation logic: ${err.message}`);
        return new Response(err.message);
    }
};

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    const data = await request.json();

    console.log('data from api/server/logic/calculation-logic:', data);

    try {
        const response = await createCalculationLogic(
            data.FieldId,
            data.Enabled,
            data.FallbackValue
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error creating the calculation logic: ${err.message}`);
        return new Response(err.message);
    }
}; 