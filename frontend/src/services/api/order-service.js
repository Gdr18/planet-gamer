import { privateClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const postOrderAndItems = data => {
	const request = privateClient.post('/orders/with-items', data)
	return apiWrapper(request)
}
