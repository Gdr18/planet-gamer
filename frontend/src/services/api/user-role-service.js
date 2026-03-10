import { privateClient } from "./api-client";
import { apiWrapper } from "./api-wrapper";

export const getUserRoles = () => {
    const request = privateClient.get('/user-roles')
    return apiWrapper(request)
}

export const executeUserRoleAction = (method, data) => {
    const request = privateClient({
        method,
        url: `/user-roles/${method !== 'post' ? data.id : ''}`,
        data: method !== 'delete' ? data : null
    })
    return apiWrapper(request)
}