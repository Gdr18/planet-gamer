import { refreshToken } from '../services/api/auth-service'

export class AppError extends Error {
	constructor(errorKey, message, errorUi) {
		super(errorKey, message, errorUi)
		this.errorKey = errorKey
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
	console.log(error)
	const { err: errorKey, msg: apiMsg } = error.response?.data
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
			if (!message.toLowerCase().includes('usuario')) {
				errorUi = 'go_home'
				message = error.response?.data?.msg
			}
			message = 'El correo electrónico no está registrado.'
			break
		case 'password_mismatch':
			message = 'La contraseña ingresada es incorrecta.'
			break
		case 'db_integrity_error':
			if (apiMsg && apiMsg.includes('user_model.email')) {
				message = 'El correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión.'
				errorUi = 'email_duplicated'
			} else {
				errorUi = 'go_home'
			}
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
		default:
			errorUi = 'go_home'
			break
	}

	return new AppError(errorKey || 'unknown_error', message, errorUi)
}
