import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/errors'

export const getCurrentUser = async () => {
	const token = localStorage.getItem('access_token')
	if (!token) return
	return await axiosInstance
		.get('/users/me', {
			headers: { Authorization: `Bearer ${token}` }
		})
		.then(response => {
			return response.data
		})
		.catch(error => {
			return handleErrors(error, getCurrentUser)
		})
}

export const executeUserAction = async (userData, methodHTTP) => {
	const token = localStorage.getItem('access_token')
	if (!token) return
	return await axiosInstance({
		method: methodHTTP,
		url: `/users/${methodHTTP !== 'post' ? userData.id : ''}`,
		data: methodHTTP !== 'delete' ? userData : null,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(error => {
			return handleErrors(error, () => executeUserAction(userData, methodHTTP))
		})
}
