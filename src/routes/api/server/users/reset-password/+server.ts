import type { PersonRole } from '$lib/components/domain.models/login.models';
import type { RequestEvent } from '@sveltejs/kit';
import { getPersonRolesForEmail, getPersonRolesForPhone, resetPassword } from '../../../services/rean-login';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    const request = event.request;
    let availableRoles: PersonRole = [];
	let filteredRoles: PersonRole = [];
    let loginRoleId = null;
	const data = await request.json();
    console.log("data",data)
	try {
		console.log('Inside the reset password...');
		const email = data.Email;
        const resetCode = data.ResetCode;
        const newPassword = data.NewPassword;
        let phone = ''

        // const res_ = await getPersonRolesForEmail(email);
        
        if (data.Phone && data.CountryCode){
            phone = data.CountryCode + '-' + data.Phone;
            var res_ = availableRoles = await getPersonRolesForPhone(phone);
            availableRoles = res_.Data?.Roles ?? [];
       }
        else if (data.Email){
			var res_ = await getPersonRolesForEmail(email);
			availableRoles = res_.Data?.Roles ?? [];
		}
        
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
        const response = await resetPassword(resetCode, newPassword, loginRoleId, email, phone);
        return new Response(JSON.stringify({
                    Status:response.Status,
                    HttpStatusCode:response.HttpCode,
                    Message:response.Message
                }));
	} catch (err) {
		console.error(`Error reseting the password: ${err.message}`);
		return new Response(err.message);
	}
};
