import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { useAuthContext } from '../../contexts/AuthContext'
import { useApiWithErrors } from '../../hooks/useApiWithErrors'

import { login, register } from '../../services/api/auth-service'

export default function AuthComponent({ handleIconLogin, messageRegister }) {
	const [advise, setAdvise] = useState('')
	const [statusRegister, setStatusRegister] = useState(false)

	const { callApi } = useApiWithErrors()

	const { loggedUser, setLoggedUser, logoutUser, setCurrentBasket } =
		useAuthContext()

	const {
		register: registerLogin,
		handleSubmit: handleSubmitLogin,
		formState: { errors: errorsLogin }
	} = useForm({
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const {
		register: registerRegister,
		handleSubmit: handleSubmitRegister,
		formState: { errors: errorsRegister }
	} = useForm({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: ''
		}
	})

	const handleSubmitFormLogin = handleSubmitLogin(async data => {
		const { ok, response } = await callApi(() => login(data))

		if (ok) {
			const { basket, ...userData } = response
			setLoggedUser(userData)
			setCurrentBasket(basket)
		} else {
			if (
				response.errorUi === 'user_not_found' ||
				response.errorUi === 'password_mismatch'
			) {
				setAdvise(response.message)
				setTimeout(() => {
					setAdvise('')
				}, 3000)
			}
		}
	})

	const handleSubmitFormRegister = handleSubmitRegister(async data => {
		if (data.password !== data.confirmPassword) {
			setAdvise('Las contraseñas no coinciden')
			setTimeout(() => {
				setAdvise('')
			}, 3000)
			return
		}

		const { ok, response } = await callApi(() => register(data))
		
		if (ok) {
			setAdvise(response.msg)
			setTimeout(() => {
				setStatusRegister(false)
				setAdvise('')
			}, 2000)
		} else {
			if (response.errorUi === 'email_duplicated') {
				setAdvise(response.message)
				setTimeout(() => {
					setAdvise('')
				}, 3000)
			}
		}
	})

	const handleClickLogout = () => {
		logoutUser()
		handleIconLogin()
	}

	return (
		<div className='login-box-wrapper'>
			{!statusRegister && !Object.keys(loggedUser).length && (
				<form className='login-form' onSubmit={handleSubmitFormLogin}>
					<p>Login</p>

					<input
						type='email'
						{...registerLogin('email', {
							required: {
								value: true,
								message: `El campo 'Email' es requerido`
							}
						})}
						placeholder='Email'
					/>
					{errorsLogin.email && (
						<div className='errorTag'>{errorsLogin.email.message}</div>
					)}

					<input
						type='password'
						{...registerLogin('password', {
							required: {
								value: true,
								message: `El campo 'Contraseña' es requerido`
							}
						})}
						placeholder='Contraseña'
					/>
					{errorsLogin.password && (
						<div className='errorTag'>{errorsLogin.password.message}</div>
					)}

					{messageRegister ? (
						<div>Necesitas registrarte para seguir con la compra.</div>
					) : null}

					{advise !== '' ? <div className='advise'>{advise}</div> : null}
					<div className='login-form-actions'>
						<button type='submit'>Enviar</button>
						<a href='#' onClick={() => setStatusRegister(true)}>
							Registro
						</a>
					</div>
				</form>
			)}

			{statusRegister && !Object.keys(loggedUser).length && (
				<form className='login-name' onSubmit={handleSubmitFormRegister}>
					<p>Registro</p>
					<input
						type='text'
						{...registerRegister('name', {
							required: {
								value: true,
								message: `El campo 'Nombre' es requerido`
							},
							minLength: {
								value: 1,
								message: `El campo 'Nombre' debe tener como mínimo 1 caracter`
							},
							maxLength: {
								value: 50,
								message: `El campo 'Nombre' debe tener como máximo 50 caracteres`
							}
						})}
						placeholder='Nombre'
					/>
					{errorsRegister && errorsRegister.name && (
						<div className='errorTag'>{errorsRegister.name.message}</div>
					)}

					<input
						type='email'
						{...registerRegister('email', {
							required: {
								value: true,
								message: `El campo 'Email' es requerido`
							},
							maxLength: {
								value: 100,
								message: `El campo 'Email' debe tener como máximo 100 caracteres`
							},
							pattern: {
								value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
								message: `El campo 'Email' debe tener un formato como el siguiente: ejemplo@dominio.com`
							}
						})}
						placeholder='Email'
					/>
					{errorsRegister && errorsRegister.email && (
						<div className='errorTag'>{errorsRegister.email.message}</div>
					)}

					<input
						type='password'
						{...registerRegister('password', {
							required: {
								value: true,
								message: `El campo 'Contraseña' es requerido`
							},
							minLength: {
								value: 7,
								message: `El campo 'Contraseña' debe tener como mínimo 7 caracteres`
							},
							maxLength: {
								value: 70,
								message: `El campo 'Contraseña' debe tener como máximo 70 caracteres`
							},
							pattern: {
								value:
									/^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{}|;:'",.<>?/]).{7,70}$/,
								message: `El campo 'Contraseña' debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (!@#$%^&*()_-+=[]{}|;:'",.<>?/).`
							}
						})}
						placeholder='Contraseña'
					/>
					{errorsRegister && errorsRegister.password && (
						<div className='errorTag'>{errorsRegister.password.message}</div>
					)}

					<input
						type='password'
						{...registerRegister('confirmPassword', {
							required: {
								value: true,
								message: `El campo 'Confirmar Contraseña' es requerido`
							},
							minLength: {
								value: 7,
								message: `El campo 'Confirmar Contraseña' debe tener como mínimo 7 caracteres`
							},
							maxLength: {
								value: 70,
								message: `El campo 'Confirmar Contraseña' debe tener como máximo 70 caracteres`
							},
							pattern: {
								value:
									/^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{}|;:'",.<>?/]).{7,70}$/,
								message: `El campo 'Confirmar Contraseña' debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (!@#$%^&*()_-+=[]{}|;:'",.<>?/).`
							}
						})}
						placeholder='Confirmar Contraseña'
					/>
					{errorsRegister && errorsRegister.confirmPassword && (
						<div className='errorTag'>
							{errorsRegister.confirmPassword.message}
						</div>
					)}

					{advise ? (
						<div
							className={`advise ${advise.includes('correcta') ? 'success' : ''}`}
						>
							{advise}
						</div>
					) : null}

					<div className='login-form-actions'>
						<button type='submit'>Enviar</button>
						<a href='#' onClick={() => setStatusRegister(false)}>
							Login
						</a>
					</div>
				</form>
			)}

			{Object.keys(loggedUser).length > 0 && (
				<div className='login-profile'>
					<div className='welcome-title'>Bienvenido/a {loggedUser.name}</div>
					<Link to='/profile' className='profile-title'>
						Perfil
					</Link>
					<div className='logout-title' onClick={handleClickLogout}>
						Logout
					</div>
				</div>
			)}
		</div>
	)
}
