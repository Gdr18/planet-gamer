import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const getCurrentUser = async () => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance.get('/users/me', {
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}

export const executeUserAction = async (method, data) => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance({
			method,
			url: `/users/${method !== 'post' ? data.id : ''}`,
			data: method !== 'delete' ? data : null,
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}

export const getUserWithRelatedData = async userId => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance.get(`/users/${userId}/with-relations`, {
			withCredentials: true,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
	}

	return await apiWrapper(fetch)
}
