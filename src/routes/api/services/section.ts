import { BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from "./common";

//////////////////////////////////////////////////////////////////
export const getSectionById = async (
	sectionId: string
) => {
	const url = BACKEND_API_URL + `/form-sections/${sectionId}`;
	return await get_(url);
};


export const createSection = async (
	ParentTemplateId: string,
	rootSectionId: string
) => {
	const body = {
		ParentSectionId: rootSectionId,
		ParentFormTemplateId: ParentTemplateId
	};
	console.log('data from api/service/section.ts :', body);
	const url = BACKEND_API_URL + `/form-sections`;
	return await post_(url, body);
};

export const createRootSection = async (
	ParentTemplateId: string,
	parentSectionId: string,
	title: string,
	description?: string,
	sectionIdentifier?: string,
	// sequence?: string,
) => {
	const body = {
		ParentFormTemplateId: ParentTemplateId,
		SectionIdentifier: sectionIdentifier,
		Title: title,
		Description: description ? description : null,
		// Sequence: sequence,
		ParentSectionId: parentSectionId ? parentSectionId : null,
	};
	// console.log("this is section body", body)
	const url = BACKEND_API_URL + `/form-sections`;
	return await post_(url, body);
};


export const getSectionByTemplateId = async (
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
	const url = BACKEND_API_URL + `/form-sections/search${searchString}`;
	return await get_(url);
};

export const updateSection = async (
	// parentTemplateId: string,
	id: string,
	parentSectionId: string,
	title: string,
	description?: string,
	sectionIdentifier?: string,
	// sequence?: string,
) => {
	const body = {
		// ParentFormTemplateId: parentTemplateId,
		SectionIdentifier: sectionIdentifier,
		Title: title,
		Description: description ? description : null,
		// Sequence: sequence ? sequence : null,
		ParentSectionId: parentSectionId ? parentSectionId : null,
	};

	const url = BACKEND_API_URL + `/form-sections/${id}`;
	return await put_(url, body);
};


export const deleteSection = async (
	sectionId: string
) => {
	const url = BACKEND_API_URL + `/form-sections/${sectionId}`;
	return await delete_(url);
};