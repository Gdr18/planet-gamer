import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/handle-error'

export const postOrder = async (orderData) => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance({
		method: 'post',
		url: `/orders`,
		data: orderData,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(async error => {
			return await handleErrors(error, () =>
				postOrder(orderData)
			)
		})
}
