import { BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from './common';

////////////////////////////////////////////////////////////////

export const createFormTemplate = async (
	id: string,
	title: string,
	description: string,
	currentVersion: number,
	tenantId: string,
	itemsPerPage: string,
	type: string,
	ownerUserId: string,
	defaultSectionNumbering: boolean | undefined
) => {
	const body = {
		Title: title,
		...(description && { Description: description }),
		// Description: description ? description : '',
		...(currentVersion && { CurrentVersion: currentVersion }),
		// CurrentVersion: currentVersion ? currentVersion : null,
		...(tenantId && { TenantId: tenantId }),
		// TenantCode: tenantCode ? tenantCode : null,
		ItemsPerPage: itemsPerPage ? itemsPerPage : 'AllQuestions',
		Type: type ? type : 'Survey',
		OwnerUserId: ownerUserId ? ownerUserId : null,
		DefaultSectionNumbering: defaultSectionNumbering ? defaultSectionNumbering : false
	};
	const url = BACKEND_API_URL + '/form-templates';
	return await post_(url, body);
};

export const getFormTemplateById = async (
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
	const url = BACKEND_API_URL + `/form-templates/search${searchString}`;
	return await get_(url);
};

export const getFormTemplatePreviewById = async (
	templateId: string
) => {
	const url = BACKEND_API_URL + `/form-templates/${templateId}/preview`;
	return await get_(url);
};

export const getFormTemplateDetails = async (
	assessmentTemplateId: string
) => {
	const url = BACKEND_API_URL + `/form-templates/${assessmentTemplateId}/details`;
	return await get_(url);
};

export const getAllFormTemplate = async () => {
	const url = BACKEND_API_URL + `/form-templates/all`;
	return await get_(url);
};

// export const getAssessmentTemplateById = async (
// 	sessionId: string,
// 	assessmentTemplateId: string
// ) => {
// 	const url = BACKEND_API_URL + `/clinical/assessment-templates/${assessmentTemplateId}`;
// 	return await get_(sessionId, url, true);
// };

// export const searchFormTemplates = async (searchParams?: any) => {
// 	let searchString = '';
// 	if (searchParams) {
// 		const keys = Object.keys(searchParams);
// 		if (keys.length > 0) {
// 			searchString = '?';
// 			const params = [];
// 			for (const key of keys) {
// 				if (searchParams[key]) {
// 					const param = `${key}=${searchParams[key]}`;
// 					params.push(param);
// 				}
// 			}
// 			searchString += params.join('&');
// 		}
// 	}
// 	const url = `http://localhost:7272/api/v1/clinical/assessment-templates/search${searchString}`;
// 	return await get_(sessionId, url, true);
// };

export const updateFormTemplate = async (
	id: string,
	title: string,
	description: string,
	tenantId: string,
	currentVersion: string,
	type: string,
	itemsPerPage: string
) => {
	const body = {
		...(title && { Title: title }),
		...(description && { Description: description }),
		...(tenantId && { TenantId: tenantId }),
		...(currentVersion && { CurrentVersion: parseInt(currentVersion) }),
		...(type && { Type: type }),
		...(itemsPerPage && { ItemsPerPage: itemsPerPage }),
		// ...(OwnerUserId && { OwnerUserId: OwnerUserId }),
		// Title: title ?? title,
		// Description: description ?? description,
		// TenantCode: tenantCode ?? tenantCode,
		// CurrentVersion: currentVersion ?? parseInt(currentVersion),
		// Type: type ?? type,
		// ItemsPerPage: itemsPerPage ?? itemsPerPage,
	};

	const url = BACKEND_API_URL + `/form-templates/${id}`;
	return await put_(url, body);
};

export const deleteFormTemplate = async (formTemplateId: string) => {
	const url = BACKEND_API_URL + `/form-templates/${formTemplateId}`;
	return await delete_(url);
};
