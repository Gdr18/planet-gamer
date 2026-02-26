import { publicClient, privateClient } from './api-client'
import { apiWrapper } from './api-wrapper'

export const getGamesByPlatform = platform => {
	const request = publicClient.get(`/games/platforms/${platform}`, {
		withCredentials: true
	})
	return apiWrapper(request)
}

export const executeGameAction = (method, data) => {
	const request = privateClient({
		method,
		url: `/games/${method === 'post' ? '' : data.id}`,
		data
	})
	return apiWrapper(request)
}
