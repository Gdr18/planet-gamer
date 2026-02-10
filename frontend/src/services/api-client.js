import axios from 'axios'

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true
})

export const executeBasketAction = async (basketItemData, methodHTTP) => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance({
		method: methodHTTP,
		url: `/basket-items/${methodHTTP !== 'post' ? basketItemData.id : ''}`,
		data: methodHTTP !== 'delete' ? basketItemData : null,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(async error => {
			if (error.response?.data?.err === 'expired_token') {
				await refreshToken()
				return executeBasketAction(basketItemData, methodHTTP)
			}
			console.error('Error en la acción de cesta:', error)
		})
}

export const deleteBasketsUser = async userId => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance({
		method: 'delete',
		url: `/baskets/users/${userId}`,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(async error => {
			if (error.response?.data?.err === 'expired_token') {
				await refreshToken()
				return deleteBasketsUser(userId)
			}
			console.error('Error al eliminar las cestas del usuario:', error)
		})
}

export const executeOrderAction = async (orderData, methodHTTP) => {
	const token = localStorage.getItem('access_token')
	if (!token) return

	return await axiosInstance({
		method: methodHTTP,
		url: `/orders/${methodHTTP !== 'post' ? orderData.id : ''}`,
		data: methodHTTP !== 'delete' ? orderData : null,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(async error => {
			if (error.response?.data?.err === 'expired_token') {
				await refreshToken()
				return executeOrderAction(orderData, methodHTTP)
			}
			console.error('Error en la acción de orden:', error)
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
		.catch(async error => {
			if (error.response?.data?.err === 'expired_token') {
				await refreshToken()
				return executeAddressAction(addressData, methodHTTP)
			}
			console.error('Error en la acción de dirección:', error)
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
		.catch(async error => {
			if (error.response?.data?.err === 'expired_token') {
				await refreshToken()
				return executeUserAction(userData, methodHTTP)
			}
			console.error('Error en la acción de usuario:', error)
		})
}

export const refreshToken = async () => {
	const token = localStorage.getItem('refresh_token')
	if (!token) return

	return await axiosInstance({
		method: 'get',
		url: '/auth/refresh-token',
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => {
			return response.data
		})
		.catch(error => {
			if (error.response?.data.err === 'expired_token') {
				localStorage.removeItem('access_token')
				localStorage.removeItem('refresh_token')
			}
			console.log('Refresh token error', error)
			throw error
		})
}
