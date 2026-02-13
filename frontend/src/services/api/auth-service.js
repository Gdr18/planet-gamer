import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/handle-error'

export const refreshToken = async () => {
	const token = localStorage.getItem('refresh_token')
	if (!token) return

	return await axiosInstance({
		method: 'get',
		url: '/auth/refresh-token',
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => {
			localStorage.setItem('access_token', response.data.access_token)
			return response.data.user
		})
		.catch(async error => {
			throw await handleErrors(error, refreshToken)
		})
}

export const logout = async () => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance
		.post(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, null, {
			withCredentials: true,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(() => {
			localStorage.removeItem('access_token')
			localStorage.removeItem('refresh_token')
		})
		.catch(async error => {
			throw await handleErrors(error, logout)
		})
}
