import { refreshToken } from '../services/api/auth-service'

const handleExpiredTokenError = async retryCallback => {
	await refreshToken()
		.then(async () => {
			return await retryCallback()
		})
		.catch(error => {
			handleErrors(error, refreshToken)
		})
}

export const handleErrors =  async (error, requestFunction) => {
    const errorKey = error.response?.data?.err || 'unknown_error'
    let uiMsg = 'Un error desconocido ha ocurrido. Por favor, inténtalo de nuevo.'

    switch (errorKey) {
        case 'expired_token':
            if (requestFunction === refreshToken) {
                uiMsg = 'La sesión ha expirado. Por favor, inicia sesión de nuevo.'
			} else {
                await handleExpiredTokenError(() => requestFunction())
            }
        // TODO: Agregar más casos de error específicos según las necesidades de la aplicación
        break
        default:
            return { errorKey, uiMsg }
    }
    
}