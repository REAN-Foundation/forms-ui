import { BACKEND_API_URL } from "$env/static/private";
import { get_, post_ } from "./common";

export const  createQuestionResponse = async (
	FormSubmissionId: string,
	Data: { [key: string]: string }
) => {
	const body = {
		FormSubmissionId: FormSubmissionId,
		Data: Data
	};

	const url = BACKEND_API_URL + `/question-responses/save`;
	return await post_(url, body);
};

export const searchquestionResponse = async (
    searchParams?: any
) => {
    console.log('Search params are ', searchParams);
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    console.log('Search string is ', searchString);
    const url = BACKEND_API_URL + `/question-responses/search${searchString}`;
    const res = await get_(url);
    return res;
};
