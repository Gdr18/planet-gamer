import { refreshToken } from '../services/api/auth-service'

export class AppError extends Error {
	constructor(err, message, errorUi) {
		super(err, message, errorUi)
		this.err = err
		this.message = message
		this.errorUi = errorUi
	}
}

const handleExpiredTokenError = async retryCallback => {
	await refreshToken()
		.then(async () => {
			return await retryCallback()
		})
		.catch(error => {
			throw error
		})
}

export const handleErrors = async (error, requestFunction) => {
	const errorKey = error.response?.data?.err || 'unknown_error'
	let errorUi = 'not_modal'
	let message =
		'Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.'

	switch (errorKey) {
		case 'expired_token':
		case 'invalid_token':
		case 'revoked_token':
			if (requestFunction !== refreshToken) {
				await handleExpiredTokenError(() => requestFunction())
				break
			}
			localStorage.removeItem('access_token')
			localStorage.removeItem('refresh_token')
			errorUi = 'not_token'
			message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
			break
		case 'not_found':
			message = error.response?.data?.msg || message
			if (!message.toLowerCase().includes('user')) {
				errorUi = 'go_home'
			}
			break
		case 'password_mismatch':
			message = 'La contraseña ingresada es incorrecta.'
			break
		case 'email_duplicated':
			message =
				'El correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión.'
			break
		case 'paid_rejected':
			message =
				'Tu pago ha sido rechazado. Por favor, verifica tu información de pago o intenta con otro método de pago.'
			errorUi = 'show_modal'
			break
		case 'forbidden_action':
		case 'forbidden':
			message = 'No tienes permiso para realizar esta acción.'
			errorUi = 'go_home'
			break
		case 'db_generic_error':
			errorUi = 'go_home'
			break
		case 'generic_error':
			errorUi = 'go_home'
			break
	}

	return new AppError(errorKey, message, errorUi)
}
