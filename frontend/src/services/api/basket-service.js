import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const executeBasketAction = async (method, data) => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance({
			method,
			url: `/basket-items/${method !== 'post' ? data.id : ''}`,
			data: method !== 'delete' ? data : null,
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}

export const deleteBasketsUser = async userId => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance({
			method: 'delete',
			url: `/baskets/users/${userId}`,
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}
