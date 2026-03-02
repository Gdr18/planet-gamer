import { handleErrors } from '../../core/handle-errors'

export const apiWrapper = async request => {
	try {
		const response = await request
		return response?.data || response
	} catch (error) {
		return handleErrors(error)
	}
}
