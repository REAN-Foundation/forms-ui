import { REANCARE_BACKEND_API_URL } from '$env/static/private';
import type { LoginModel, PersonRole } from '$lib/components/domain.models/login.models';
import { get_, post_ } from './common';

///////////////////////////////////////////////////////////////////////////////

export const loginAsUser = async (
	loginRoleId: number | null,
	password: string,
	username?: string,
	email?: string,
	phone?: string
) => {
	try {
		const model: LoginModel = getLoginModel(loginRoleId, password, username, email, phone);
		console.log(JSON.stringify(model, null, 2));

		const body = model;
		console.log('model', model);
		const url = REANCARE_BACKEND_API_URL + '/users/login-with-password';

		return await post_(url, body);
	} catch (error) {
		console.log('error', error);
	}
};

export const SendPasswordResetCode = async (email?: string, phone?: string) => {
	const model = {
		Email: email,
		Phone: phone
	};

	const body = model;
	console.log('model', model);
	const url = REANCARE_BACKEND_API_URL + `/users/send-password-reset-code`;

	return await post_(url, body);
};

export const resetPassword = async (
	resetCode: string,
	newPassword: string,
	loginRoleId: number | null,
	email?: string,
	phone?: string
) => {
	const model = {
		NewPassword: newPassword,
		ResetCode: resetCode,
		RoleId: loginRoleId,
		Email: email,
		Phone: phone
	};

	const body = model;
	console.log('IN USER.TS');

	const url = REANCARE_BACKEND_API_URL + `/users/reset-password`;

	return await post_(url, body);
};

export const getUserRoles = async (): Promise<PersonRole[]> => {
	try {
		const url = REANCARE_BACKEND_API_URL + '/types/person-roles';
		const response = await get_(url);
		return response.Data.PersonRoleTypes;
	} catch (error) {
		console.error(`Error retrieving user roles:. Switching to default roles...`);
		return [];
	}
};

export function findRoleDataByName(
	roles: UserRoles[],
	roleName: string
): { roleId: number; isSystemAdmin: boolean } {
	const role = roles.find((r) => r.RoleName === RolesData[roleName]);
	if (!role) {
		throw new Error(`Role with name "${roleName}" not found.`);
	}
	return { roleId: role.id, isSystemAdmin: role.IsSystemRole };
}

export const getPersonRolesForPhone = async (phone: string) => {
	const url = REANCARE_BACKEND_API_URL + '/persons/roles-for-phone?phone=' + phone;
	return await get_(url);
};

export const getPersonRolesForEmail = async (email: string) => {
	const url = REANCARE_BACKEND_API_URL + '/persons/roles-for-email?email=' + email;
	return await get_(url);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
const getLoginModel = (
	loginRoleId: number | null,
	password: string,
	username?: string,
	email?: string,
	phone?: string
): LoginModel => {
	const loginModel: LoginModel = {};

	if (username) {
		loginModel.UserName = username;
	}
	if (phone) {
		loginModel.Phone = phone;
	}
	if (email) {
		loginModel.Email = email;
	}
	if (password) {
		loginModel.Password = password;
	}
	if (loginRoleId) {
		loginModel.LoginRoleId = loginRoleId;
	}

	return loginModel;
};

type UserRoles = {
	id: number;
	RoleName: string;
	Description: string;
	TenantId: string | null;
	IsUserRole: boolean;
	IsSystemRole: boolean;
	IsDefaultRole: boolean;
	CreatedAt: string;
};

const RolesData: Record<string, string> = {
	admin: 'System admin',
	deviceAdmin: 'Device administrator',
	firmwareDeveloper: 'Firmware developer',
	systemDeveloper: 'Internal developer',
	tenantDeveloper: 'External developer',
	iClientAppOwner: 'Internal client app owner',
	eClientAppOwner: 'External client app owner',
	support: 'Technical support',
	doctor: 'Doctor',
	nurse: 'Nurse',
	healthWorker: 'Health worker',
	tenantAdmin: 'Tenant admin'
};
