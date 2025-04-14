import { fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { PersonRole } from '$lib/components/domain.models/login.models';
import {
	getPersonRolesForEmail,
	getPersonRolesForPhone,
	getUserRoles,
	loginAsUser
} from './api/services/rean-login';
import { UserRoles } from '$lib/components/system.types';
import { errorMessage, successMessage } from '$lib/components/toast/message.utils';
import { SessionManager } from './api/cache/session/session.manager';
import type { Session } from './api/cache/session';
import { CookieUtils } from '$lib/utils/cookie.utils';

/////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	try {
		let roles: PersonRole[] = await getUserRoles();
		if (!roles || roles.length === 0) {
			roles = UserRoles;
		}
		return {
			message: 'Common data successfully retrieved!',
			roles
		};
	} catch (error) {
		console.error(`Error retrieving data :`);
		throw redirect(303, '/');
	}
};

/////////////////////////////////////////////////////

export const actions: Actions = {
	login: async (event: RequestEvent) => {
		const loginFormData = Object.fromEntries(await event.request.formData());
		const credentials = loginSchema.safeParse(loginFormData);
		const result = credentials.data;
		console.log(`${credentials.data?.username} ${credentials.data?.password}`);
		if (!credentials.success) {
			const errors = credentials.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		let phone;
		const allRoles: PersonRole[] = await getUserRoles();
		// console.log('allRoled', allRoles);

		let availableRoles: PersonRole[] = [];
		let filteredRoles: PersonRole[] = [];

		let loginRoleId = null;

		if (result?.phone && result.countryCode) {
			phone = result.countryCode + '-' + result.phone;
			let res_ = (availableRoles = await getPersonRolesForPhone(phone));
			console.log(phone);
			availableRoles = res_.Data?.Roles ?? [];
		} else if (result?.email) {
			let res_ = await getPersonRolesForEmail(result.email);
			availableRoles = res_.Data?.Roles ?? [];
		}

		if (availableRoles.length > 0) {
			filteredRoles = availableRoles.filter(
				(x: any) => x.RoleName !== 'Doctor'
				//  && x.RoleName !== 'Patient'
			);
			if (filteredRoles.length > 0) {
				loginRoleId = filteredRoles[0].id;
			}
		} else {
			if (allRoles.length > 0) {
				if (result?.username && result?.username === 'admin') {
					filteredRoles = allRoles.filter((x) => x.RoleName === 'System admin');
					if (filteredRoles.length > 0) {
						loginRoleId = filteredRoles[0].id;
					}
				} else {
					filteredRoles = allRoles.filter(
						(x) =>
							x.RoleName === 'System user' ||
							x.RoleName === 'Tenant admin' ||
							x.RoleName === 'Tenant user'
					);
					if (filteredRoles.length > 0) {
						loginRoleId = filteredRoles[0].id;
					}
				}
			}
		}

		console.log('available roles', availableRoles);
		console.log('filtered roles', loginRoleId);

		if (filteredRoles.length == 0) {
			throw redirect(303, '/', errorMessage('Invalid user!'), event);
		}

		const response = await loginAsUser(
			loginRoleId,
			credentials.data?.password,
			credentials.data?.username ?? '',
			credentials.data?.email ?? '',
			phone
		);
		if (response.Status == 'failure' || response.HttpCode !== 200) {
			const errors = [
				{
					field: '',
					message: response.Message
				}
			];
			return fail(400, { error: true, errors });
		}

		// if (!response.Data.User.Role || !response.Data.User.Role.RoleName) {
		// 	throw redirect(303, '/', errorMessage('Permission Denied!'), event);
		// }
		// if (
		// 	!['System admin', 'System user', 'Tenant admin', 'Tenant user'].includes(
		// 		response.Data.User.Role.RoleName
		// 	)
		// ) {
		// 	throw redirect(303, '/', errorMessage('Permission Denied!'), event);
		// }

		const user = response.Data.User;
		user.SessionId = response.Data.SessionId;
		const accessToken = response.Data.AccessToken;
		const refreshToken = response.Data.RefreshToken;
		const expiryDate = new Date(response.Data.SessionValidTill);
		const sessionId = response.Data.SessionId;
		const userId: string = response.Data.User.id;

		const session = await SessionManager.constructSession(
			user,
			accessToken,
			expiryDate,
			refreshToken
		);
		console.log('Session ' + JSON.stringify(session));
		const userSession = await SessionManager.addSession(
			session?.sessionId as string,
			session as Session
		);
		console.log('User Session ' + JSON.stringify(userSession));
		if (!session) {
			throw redirect(303, `/`, errorMessage(`Use login session cannot be created!`), event);
		}
		CookieUtils.setCookieHeader(event, 'sessionId', sessionId);

		throw redirect(303, `/users/${userId}/form-templates`, successMessage(`Login successful!`), event);
	}
};

const loginSchema = z.object({
	username: z.string().trim().min(1, { message: "Name can't be empty" }).optional(),
	password: z.string().trim().min(1, { message: 'Password can`t be empty' }),
	email: z.string().optional(),
	phone: z.string().optional(),
	countryCode: z.string().optional()
});
