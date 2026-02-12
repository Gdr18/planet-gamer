import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/errors'

export const getAddressesUser = async userId => {
	const token = localStorage.getItem('access_token')
	if (!token) return
	return await axiosInstance({
		method: 'get',
		url: `/addresses/users/${userId}`,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(error => {
			return handleErrors(error, () => getAddressesUser(userId))
		})
}

export const executeAddressAction = async (addressData, methodHTTP) => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance({
		method: methodHTTP,
		url: `/addresses/${methodHTTP !== 'post' ? addressData.id : ''}`,
		data: methodHTTP !== 'delete' ? addressData : null,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(error => {
			return handleErrors(error, () =>
				executeAddressAction(addressData, methodHTTP)
			)
		})
}
