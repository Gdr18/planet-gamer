import { privateClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const executeBasketAction = (method, data) => {
	const request = privateClient({
		method,
		url: `/basket-items/${method !== 'post' ? data.id : ''}`,
		data: method !== 'delete' ? data : null
	})
	return apiWrapper(request)
}

export const deleteBasketsUser = userId => {
	const request = privateClient.delete(`/basket-items/users/${userId}`)
	return apiWrapper(request)
}
