import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/handle-error'

export const register = async data => {
	return await axiosInstance
		.post('/auth/register', data, {
			withCredentials: true
		})
		.then(response => {
			return response.data
		})
		.catch(async error => {
			throw await handleErrors(error, () => register(data))
		})
}

export const login = async data => {
	return await axiosInstance
		.post('/auth/login', data, {
			withCredentials: true
		})
		.then(response => {
			localStorage.setItem('access_token', response.data.access_token)
			localStorage.setItem('refresh_token', response.data.refresh_token)
			return response.data.user
		})
		.catch(async error => {
			throw await handleErrors(error, () => login(data))
		})
}

export const logout = async () => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance
		.post('/auth/logout', null, {
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

export const refreshToken = async () => {
	const token = localStorage.getItem('refresh_token')
	if (!token) return

	return await axiosInstance
		.get('/auth/refresh-token', {
			withCredentials: true,
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
