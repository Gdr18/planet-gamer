import { privateClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const getAddressesUser = userId => {
	const request = privateClient.get(`/addresses/users/${userId}`)
	return apiWrapper(request)
}

export const executeAddressAction = (method, data) => {
	const request = privateClient({
		method,
		url: `/addresses/${method !== 'post' ? data.id : ''}`,
		data: method !== 'delete' ? data : null
	})
	return apiWrapper(request)
}
