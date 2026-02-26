import { privateClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const executePayment = async paymentData => {
	const request = privateClient.post('/payments', paymentData)
	return apiWrapper(request)
}
