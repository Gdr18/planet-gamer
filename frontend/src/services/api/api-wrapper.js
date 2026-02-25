import { handleErrors } from '../../core/handle-error'

export const apiWrapper = async (request) => {
    try {
        const response = await request()
        return response.data || response
    } catch (error) {
        const errorHandled = await handleErrors(error, request)
        if (errorHandled instanceof Error) throw errorHandled
        return errorHandled
    }
}