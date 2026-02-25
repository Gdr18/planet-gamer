import { axiosInstance } from './api-client'
import { apiWrapper } from './api-wrapper'

export const getGamesByPlatform = async platform => {
	const fetch = () => {
		return axiosInstance.get(`/games/platforms/${platform}`, {
			withCredentials: true
		})
	}

	return await apiWrapper(fetch)
}

export const executeGameAction = async (method, data) => {
	const fetch = () => {
		return axiosInstance({
			method,
			url: `/games/${method === 'post' ? '' : data.id}`,
			data,
			withCredentials: true,
			headers: {
				Authorization: `Bearer ${localStorage.getItem('access_token')}`
			}
		})
	}

	return await apiWrapper(fetch)
}
