import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { useLoginContext } from '../../contexts/login-context'
import { useCartContext } from '../../contexts/cart-context'

export default function Login({ handleIconLogin, messageRegister }) {
	const [data, setData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
		name: ''
	})

	const [errorText, setErrorText] = useState('')
	const [register, setRegister] = useState(false)

	const { loggedUser, setLoggedUser, handleLogout } = useLoginContext()
	const { cleaningBasket } = useCartContext()

	const handleChange = event => {
		setData({
			...data,
			[event.target.name]: event.target.value
		})
	}

	const handleSubmitLogin = event => {
		event.preventDefault()
		axios
			.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, data, {
				withCredentials: true
			})
			.then(response => {
				if (response.data.err) {
					setErrorText(response.data.msg)
					setTimeout(() => {
						setErrorText('')
					}, 2000)
					return
				}
				setLoggedUser(response.data.user)
				localStorage.setItem('access_token', response.data.access_token)
				localStorage.setItem('refresh_token', response.data.refresh_token)
			})
			.catch(() => {
				setErrorText('Ha ocurrido un error...')
				setTimeout(() => {
					setErrorText('')
				}, 2000)
			})
	}

	const handleSubmitRegister = event => {
		event.preventDefault()
		if (data.password !== data.confirmPassword) {
			setErrorText('Las contraseñas no coinciden')
			setTimeout(() => {
				setErrorText('')
			}, 2000)
			return
		}
		axios
			.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, data, {
				withCredentials: true
			})
			.then(response => {
				if (response.data.err) {
					setErrorText(response.data.msg)
				}
				setErrorText('Registro completado con éxito.')
				setTimeout(() => {
					setRegister(false)
					setErrorText('')
				}, 1500)
			})
			.catch(() => {
				setErrorText('Ha ocurrido un error...')
			})
	}

	const handleClickLogout = () => {
		handleLogout()
		cleaningBasket()
		handleIconLogin()
	}

	return (
		<div className='login-box-wrapper'>
			{!register && !loggedUser && (
				<form className='login-form' onSubmit={handleSubmitLogin}>
					<p>Login</p>

					<input
						type='email'
						name='email'
						placeholder='Email'
						value={data.email}
						onChange={handleChange}
						maxLength={50}
						required
					/>

					<input
						type='password'
						name='password'
						placeholder='Contraseña'
						value={data.password}
						onChange={handleChange}
						minLength={6}
						maxLength={200}
						required
					/>
					{messageRegister ? (
						<div>Necesitas registrarte para seguir con la compra.</div>
					) : null}
					{errorText !== '' ? <div>{errorText}</div> : null}
					<div className='login-form-actions'>
						<button type='submit'>Enviar</button>
						<a href='#' onClick={() => setRegister(true)}>
							Registro
						</a>
					</div>
				</form>
			)}

			{register && !loggedUser && (
				<form className='login-name' onSubmit={handleSubmitRegister}>
					<input
						type='text'
						name='name'
						placeholder='Nombre'
						value={data.name}
						onChange={handleChange}
						minLength={2}
						maxLength={50}
						required
					/>
					<input
						type='email'
						name='email'
						placeholder='Email'
						value={data.email}
						onChange={handleChange}
						maxLength={50}
						required
					/>

					<input
						type='password'
						name='password'
						placeholder='Contraseña'
						value={data.password}
						onChange={handleChange}
						minLength={6}
						maxLength={200}
						required
					/>

					<input
						type='password'
						name='confirmPassword'
						placeholder='Confirmar Contraseña'
						value={data.confirmPassword}
						onChange={handleChange}
						minLength={6}
						maxLength={200}
						required
					/>
					{errorText ? <div>{errorText}</div> : null}
					<button type='submit'>Enviar</button>
				</form>
			)}

			{loggedUser && (
				<div className='login-profile'>
					<div className='welcome-title'>Bienvenido/a {loggedUser.name}</div>
					<Link to={`/profile/${loggedUser.id}`} className='profile-title'>
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