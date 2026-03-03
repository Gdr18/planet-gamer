import axios from 'axios'

const baseConfig = {
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true
}

export const publicClient = axios.create(baseConfig)
export const privateClient = axios.create(baseConfig)

const getAccessWithRefresh = async refreshToken => {
	try {
		const response = await publicClient.get('/auth/refresh-token', {
			headers: {
				Authorization: `Bearer ${refreshToken}`
			}
		})
		const newAccessToken = response.data?.access_token || null
		if (newAccessToken) {
			localStorage.setItem('access_token', newAccessToken)
			return newAccessToken
		}
	} catch (refreshError) {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		throw refreshError
	}
}

privateClient.interceptors.request.use(async config => {
	const accessToken = localStorage.getItem('access_token')
	const refreshToken = localStorage.getItem('refresh_token')

	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`
	} else if (refreshToken) {
		const newAccessToken = await getAccessWithRefresh(refreshToken)
		if (newAccessToken) {
			config.headers.Authorization = `Bearer ${newAccessToken}`
		}
	} else {
		return Promise.reject(
			new axios.Cancel(
				'No se puede recuperar al usuario. Por favor, inicia sesión de nuevo.'
			)
		)
	}

	return config
})

privateClient.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config
		const errorCode = error.response?.data?.err

		const isTokenError = [
			'expired_token',
			'invalid_token',
			'revoked_token'
		].includes(errorCode)

		if (originalRequest && isTokenError && !originalRequest._retry) {
			const refreshToken = localStorage.getItem('refresh_token')

			if (!refreshToken) {
				return Promise.reject(error)
			}

			originalRequest._retry = true

			try {
				const newAccessToken = await getAccessWithRefresh(refreshToken)

				if (newAccessToken) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

					return privateClient(originalRequest)
				}
			} catch (refreshError) {
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)
