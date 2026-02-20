import { axiosInstance } from './api-client'
import { handleErrors } from '../../core/handle-error'

export const getGamesByPlatform = async platform => {
	return await axiosInstance
		.get(`/games/platforms/${platform}`)
		.then(response => response.data)
		.catch(error => {
			throw handleErrors(error)
		})
}

export const executeGameAction = async (method, data) => {
	return await axiosInstance({
		method,
		url: `/games/${method === 'post' ? '' : data.id}`,
		data,
		withCredentials: true,
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		}
	})
		.then(response => response.data)
		.catch(error => {
			throw handleErrors(error)
		})
}
