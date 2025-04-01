import type { RequestEvent } from "@sveltejs/kit";
import { deleteFormTemplate } from "../../../services/form-template";

/////////////////////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
    const templateId = event.params.templateId;
    console.log('Deleted session id is :', templateId);

    try {
        const response = await deleteFormTemplate(
            templateId,
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error deleting assessment node: ${err}`);
        return new Response(err);
    }
};

