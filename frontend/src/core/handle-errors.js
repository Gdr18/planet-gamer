export class AppError extends Error {
	constructor(errorKey, message, errorUi) {
		super(message, errorKey, errorUi)
		this.errorKey = errorKey
		this.errorUi = errorUi
		this.message = message
	}
}

export const handleErrors = error => {
	console.log(error, 'error in handleErrors')
	
	let errorUi = 'not_modal'
	let message =
	'Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.'
	
	
	let { err: errorKey, msg: apiMsg } = error.response?.data || {err: 'unknown_error', msg: ''}
	
	if (error.code === 'ERR_CANCELED') {
		errorKey = 'request_canceled'
		message = error.message || 'La solicitud ha sido cancelada. Por favor, inténtalo de nuevo.'
	}

	switch (errorKey) {
		case 'expired_token':
		case 'invalid_token':
		case 'revoked_token':
		case 'not_token':
			errorUi = 'not_token'
			message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
			break
		case 'not_found':
			if (apiMsg && !apiMsg.toLowerCase().includes('usuario')) {
				errorUi = 'go_home'
				message = apiMsg
			} else {
				message = 'El correo electrónico no está registrado.'
				errorUi = 'user_not_found'
			}
			break
		case 'password_mismatch':
			message = 'La contraseña ingresada es incorrecta.'
			errorUi = 'password_mismatch'
			break
		case 'db_integrity_error':
			if (apiMsg && apiMsg.includes('user_model.email')) {
				message =
					'El correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión.'
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
	}

	throw new AppError(errorKey, message, errorUi)
}
