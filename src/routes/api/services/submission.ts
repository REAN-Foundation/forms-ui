import { BACKEND_API_URL, FRONT_END_URL } from "$env/static/private";
import { get_, post_ } from "./common";

export const createSubmission = async (
	templateId: string,
) => {
	const body = {
		FormTemplateId: templateId,
		FormUrl: FRONT_END_URL + `/form/submission`
	};

	const url = BACKEND_API_URL + `/form-submissions`;
	return await post_(url, body);
};

export const submit = async (
	submissionId: string,
) => {
	const body = {};
	const url = BACKEND_API_URL + `/form-submissions/${submissionId}/submit`;
	return await post_(url, body);
}

export const getFormSubmission = async (
	submissionId: string,
) => {
	const url = BACKEND_API_URL + `/form-submissions/${submissionId}`;
	return await get_(url);
}

export const getSubmission = async (
	searchParams?: any
) => {
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
	const url = BACKEND_API_URL + `/form-submissions/search${searchString}`;
	const res = await get_(url);
	console.log(res, 'result from submission')
	return res;
};