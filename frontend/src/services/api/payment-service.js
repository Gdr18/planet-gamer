import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const executePayment = async paymentData => {
	const fetch = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axiosInstance({
			method: 'post',
			url: '/payments',
			data: paymentData,
			headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}
