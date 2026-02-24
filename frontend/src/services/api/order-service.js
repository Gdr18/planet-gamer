import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/handle-error'

export const postOrderAndItems = async (orderData) => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance({
		method: 'post',
		url: '/orders/with-items',
		data: orderData,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(async error => {
			return await handleErrors(error, () =>
				postOrderAndItems(orderData)
			)
		})
}
