import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const register = async data => {
	const fetch = () => {
		return axiosInstance.post('/auth/register', data, {
			withCredentials: true
		})
	}
	
	return await apiWrapper(fetch)
}

export const login = async data => {
	const fetch = async () => {
		const response = await axiosInstance.post('/auth/login', data, {
			withCredentials: true
		})

		localStorage.setItem('access_token', response.data.access_token)
		localStorage.setItem('refresh_token', response.data.refresh_token)

		return response.data.user
	}
	return await apiWrapper(fetch)
}

export const logout = async () => {
	const fetch = async () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		const response = await axiosInstance.post('/auth/logout', null, {
			withCredentials: true,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})

		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')

		return response
	}
	return await apiWrapper(fetch)
}

export const refreshToken = async () => {
	const token = localStorage.getItem('refresh_token')
	if (!token) return

	const refresh = async () => {
		const response = await axiosInstance.get('/auth/refresh-token', {
			withCredentials: true,
			headers: { Authorization: `Bearer ${token}` }
		})

		localStorage.setItem('access_token', response.data.access_token)

		return response.data.user
	}

	return await apiWrapper(refresh)
}
