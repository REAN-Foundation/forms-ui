import type { RequestEvent } from '@sveltejs/kit';
import { getPersonRolesForEmail, getPersonRolesForPhone, SendPasswordResetCode } from '../../../services/rean-login';


//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    let availableRoles: PersonRole = [];
	let filteredRoles: PersonRole = [];
    let loginRoleId = null;
	const data = await request.json();
	try {
		console.log('Inside the send reset password code...');
		let email = data.Email;
        let phone = ''

        if (data.Phone && data.CountryCode){
            phone = data.CountryCode + '-' + data.Phone;
            var res_ = availableRoles = await getPersonRolesForPhone(phone);
            availableRoles = res_.Data?.Roles ?? [];
       }
        else if (data.Email){
			var res_ = await getPersonRolesForEmail(email);
			availableRoles = res_.Data?.Roles ?? [];
		}
        // const res_ = await getPersonRolesForEmail(email);
        availableRoles = res_.Data?.Roles ?? [];

        if (availableRoles.length > 0) {
            filteredRoles = availableRoles.filter((x) => x.RoleName !== 'Doctor' && x.RoleName !== 'Patient');
            if (filteredRoles.length > 0) {
                loginRoleId = filteredRoles[0].id;
            }
        }

        if (filteredRoles.length > 1) {
            return new Response(JSON.stringify({
                Status:'failure',
                HttpStatusCode:409,
                Message:'Multiple administrative roles associated with email.'
            }))
        }
        if (filteredRoles.length == 0) {
            return new Response(JSON.stringify({
                Status:'failure',
                HttpStatusCode:409,
                Message:'Found no administrative roles associated with email.'
            }));
        }
        
		const response = await SendPasswordResetCode(email, phone);
		return new Response(JSON.stringify({
			Status:response.Status,
			HttpStatusCode:response.HttpCode,
			Message:response.Message
		}));
	} catch (err) {
		console.error(`Error sending code: ${err.message}`);
		return new Response(err.message);
	}
};
