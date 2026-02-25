import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const postOrderAndItems = async data => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance({
			method: 'post',
			url: '/orders/with-items',
			data,
			headers: { Authorization: `Bearer ${token}` },
			withCredentials: true
		})
	}
	
	return await apiWrapper(fetch)
}
