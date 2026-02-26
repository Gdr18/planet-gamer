import axios from 'axios'

const baseConfig = {
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true
}

export const publicClient = axios.create(baseConfig)
export const privateClient = axios.create(baseConfig)

privateClient.interceptors.request.use(config => {
	const token = localStorage.getItem('access_token')

	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

privateClient.interceptors.response.use(
	response => response,
	error => {
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

			return publicClient
				.post('/auth/refresh-token', null, {
					headers: {
						Authorization: `Bearer ${refreshToken}`
					}
				})
				.then(response => {
					const accessToken = response.data.access_token
					localStorage.setItem('access_token', accessToken)

					originalRequest.headers = originalRequest.headers ?? {}
					originalRequest.headers.Authorization = `Bearer ${accessToken}`

					return privateClient(originalRequest)
				})
				.catch(refreshError => {
					localStorage.removeItem('access_token')
					localStorage.removeItem('refresh_token')
					return Promise.reject(refreshError)
				})
		}

		return Promise.reject(error)
	}
)
