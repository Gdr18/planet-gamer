import axios from 'axios'

import { refreshUser } from '../contexts/login-context'

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true
})

async function handleExpiredTokenError(error, errorMsg, retryCallback) {
	if (error.response?.data?.err === 'expired_token') {
		await refreshUser()
		return retryCallback()
	}

	console.error(errorMsg, error)

	throw error
}

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
			const errorMsg = `Error en la acción de cesta (${methodHTTP}):`
			return await handleExpiredTokenError(error, errorMsg, () =>
				executeBasketAction(basketItemData, methodHTTP)
			)
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
			const errorMsg = 'Error al eliminar las cestas del usuario:'
			return await handleExpiredTokenError(error, errorMsg, () => deleteBasketsUser(userId))
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
			const errorMsg = `Error en la acción de orden (${methodHTTP}):`
			return await handleExpiredTokenError(error, errorMsg, () => executeOrderAction(orderData, methodHTTP))
		})
}

export const getAddressesUser = async userId => {
	const token = localStorage.getItem('access_token')
	if (!token) return
	return await axiosInstance({
		method: 'get',
		url: `/addresses/users/${userId}`,
		headers: { Authorization: `Bearer ${token}` }
	})
		.then(response => response.data)
		.catch(async error => {
			const errorMsg = 'Error al obtener las direcciones del usuario:'
			return await handleExpiredTokenError(error, errorMsg, () => getAddressesUser(userId))
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
			const errorMsg = `Error en la acción de dirección (${methodHTTP}):`
			return await handleExpiredTokenError(error, errorMsg, () => executeAddressAction(addressData, methodHTTP))
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
			const errorMsg = `Error en la acción de usuario (${methodHTTP}):`
			return await handleExpiredTokenError(error, errorMsg, () => executeUserAction(userData, methodHTTP))
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
			throw error
		})
}
