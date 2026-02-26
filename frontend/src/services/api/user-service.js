import { privateClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const getCurrentUser = () => {
	const request = privateClient.get('/users/me')
	return apiWrapper(request)
}

export const executeUserAction = (method, data) => {
	const request = privateClient({
		method,
		url: `/users/${method !== 'post' ? data.id : ''}`,
		data: method !== 'delete' ? data : null
	})
	return apiWrapper(request)
}

export const getUserWithRelatedData = userId => {
	const request = privateClient.get(`/users/${userId}/with-relations`)
	return apiWrapper(request)
}
