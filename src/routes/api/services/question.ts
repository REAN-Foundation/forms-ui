import { BACKEND_API_URL } from '$env/static/private';
import chalk from 'chalk';
import { delete_, get_, post_, put_ } from './common';

////////////////////////////////////////////////////////////////

export const createQuestion = async (
	parentTemplateId: string,
	parentSectionId: string,
	responseType?: string,

) => {
	const body = {
		ParentTemplateId: parentTemplateId,
		ParentSectionId: parentSectionId,
		ResponseType: responseType,

	};
	console.log(body)
	const url = BACKEND_API_URL + `/questions`;
	// }
	return await post_(url, body);
};

export const getQuestionById = async (
	questionId: string
) => {
	const url = BACKEND_API_URL + `/questions/${questionId}`;
	return await get_(url);
};

export const getQuestionsByTemplateId = async (
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
	console.log(`this is template id and this is node ${searchString}`)
	const url = BACKEND_API_URL + `/questions/search${searchString}`;
	const res = await get_(url);
	// console.log(res," this is result of node by templatet")
	return res
};

export const updateQuestion = async (
	qestionId: string,
	// parentTemplateId: string,
	// parentSectionId: string,
	title: string,
	description?: string,
	// displayCode?: string,
	responseType?: string,
	score?: number,
	correctAnswer?: string,
	hint?: string,
	questionImageUrl?: string,
	options?: string[],
	rangeMin?: number,
	rangeMax?: number,
) => {

	const body = {
		Title: title,
		...(description && { Description: description }),
		// ...(responseType && { ResponseType: responseType }),
		ResponseType: responseType,
		...(score && { Score: score }),
		...(correctAnswer && { CorrectAnswer: correctAnswer }),
		...(hint && { Hint: hint }),
		...(questionImageUrl && { QuestionImageUrl: questionImageUrl }),
		...(rangeMin && { RangeMin: rangeMin }),
		...(rangeMax && { RangeMax: rangeMax }),
		...(options && options.length > 0 && { Options: options })
	};

	const url = BACKEND_API_URL + `/questions/${qestionId}`;
	return await put_(url, body);
};

export const deleteQuestion = async (
	questionId: string,
) => {
	console.log(chalk.red("questionId to delete.........................?", questionId))

	const url = BACKEND_API_URL + `/questions/${questionId}`;
	return await delete_(url);
};




