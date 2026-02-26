import { privateClient, publicClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const register = data => {
	const request = publicClient.post('/auth/register', data)
	return apiWrapper(request)
}

export const login = data => {
		const request = publicClient.post('/auth/login', data).then(response => {
			localStorage.setItem('access_token', response.data.access_token)
			localStorage.setItem('refresh_token', response.data.refresh_token)
			return response.data.user
		})
	return apiWrapper(request)
}

export const logout = () => {
	const request = privateClient.post('/auth/logout').then(() => {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
	})
	return apiWrapper(request)
}
