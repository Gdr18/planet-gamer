import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const getAddressesUser = async userId => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return
		return axiosInstance.get(`/addresses/users/${userId}`, {
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}

export const executeAddressAction = async (method, data) => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance({
			method,
			url: `/addresses/${method !== 'post' ? data.id : ''}`,
			data: method !== 'delete' ? data : null,
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}
