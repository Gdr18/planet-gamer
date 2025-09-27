import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { useLoginContext } from '../../contexts/login-context'
import { useCartContext } from '../../contexts/cart-context'

export default function Login({ handleIconLogin, messageRegister }) {
	const [login, setLogin] = useState({
		email: '',
		password: '',
		name: ''
	})

	const [errorText, setErrorText] = useState('')
	const [secondPhaseRegistration, setSecondPhaseRegistration] = useState(false)

	const { loggedUser, setLoggedUser, handleLogout } = useLoginContext()
	const { cleaningBasket, rescuingBasket } = useCartContext()

	const handleChange = event => {
		setLogin({
			...login,
			[event.target.name]: event.target.value
		})
	}

	const handleSubmitLogin = event => {
		axios
			.post(`${import.meta.env.VITE_BACKEND_URL}/auth`, login, {
				withCredentials: true
			})
			.then(response => {
				if (response.data.name === '') {
					setSecondPhaseRegistration(true)
				} else {
					setLoggedUser(response.data)
					setSecondPhaseRegistration(false)
					setLogin({
						email: '',
						password: '',
						name: ''
					})
					rescuingBasket(response.data.id)
				}
			})
			.catch(error => {
				error.response.status === 401
					? setErrorText(error.response.data.error)
					: setErrorText('Ha ocurrido un error...')
			})
		event.preventDefault()
	}

	const handleClickLogout = () => {
		handleLogout()
		cleaningBasket()
		handleIconLogin()
	}

	return (
		<div className='login-box-wrapper'>
			{loggedUser === '' && !secondPhaseRegistration ? (
				<form className='login-form' onSubmit={handleSubmitLogin}>
					<p>Loguéate o Regístrate</p>

					<input
						type='email'
						name='email'
						placeholder='Email'
						value={login.email}
						onChange={handleChange}
						maxLength={50}
						required
					/>

					<input
						type='password'
						name='password'
						placeholder='Contraseña'
						value={login.password}
						onChange={handleChange}
						minLength={6}
						maxLength={200}
						required
					/>
					{messageRegister ? (
						<div>Necesitas registrarte para seguir con la compra.</div>
					) : null}
					{errorText !== '' ? <div>{errorText}</div> : null}
					<button type='submit'>Enviar</button>
				</form>
			) : null}

			{loggedUser === '' && secondPhaseRegistration ? (
				<form className='login-name' onSubmit={handleSubmitLogin}>
					<input
						type='text'
						name='name'
						placeholder='Nombre'
						value={login.name}
						onChange={handleChange}
						minLength={2}
						maxLength={50}
						required
					/>

					<button type='submit'>Enviar</button>
				</form>
			) : null}

			{loggedUser !== '' ? (
				<div className='login-profile'>
					<div className='welcome-title'>Bienvenido/a {loggedUser.name}</div>
					<Link to={`/profile/${loggedUser.id}`} className='profile-title'>
						Perfil
					</Link>
					<div className='logout-title' onClick={handleClickLogout}>
						Logout
					</div>
				</div>
			) : null}
		</div>
	)
}
