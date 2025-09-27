import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import axios from 'axios'

import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { TbEdit } from 'react-icons/tb'

import { useLoginContext } from '../../contexts/login-context'
import { useCartContext } from '../../contexts/cart-context'

export default function Profile() {
	const { loggedUser, handleLogout, rescuingUser } = useLoginContext()
	const { cleaningBasket } = useCartContext()

	const navigate = useNavigate()

	const [editUser, setEditUser] = useState(true)
	const [editAddress, setEditAddress] = useState(true)

	const {
		register: registerUser,
		handleSubmit: handleSubmitUser,
		formState: { errors: errorsUser }
	} = useForm({
		defaultValues: {
			name: loggedUser.name,
			surnames: loggedUser.surnames,
			email: loggedUser.email,
			password: '',
			phone_number: loggedUser.phone_number,
			admin: loggedUser.admin
		}
	})

	const {
		register: registerAddress,
		handleSubmit: handleSubmitAddress,
		formState: { errors: errorsAddress },
		reset
	} = useForm({
		defaultValues: {
			street: '',
			second_line_street: '',
			postal_code: '',
			city: ''
		}
	})

	const [ordersUser, setOrdersUser] = useState([])

	useEffect(() => {
		axios
			.get(
				`${import.meta.env.VITE_BACKEND_URL}/address-user/${loggedUser.id}`,
				{ withCredentials: true }
			)
			.then(response => {
				if (Object.keys(response.data).length > 0) {
					reset({
						street: response.data.street,
						second_line_street: response.data.second_line_street,
						postal_code: response.data.postal_code,
						city: response.data.city
					})
				}
			})
	}, [])

	useEffect(() => {
		axios
			.get(
				`${import.meta.env.VITE_BACKEND_URL}/orders/${loggedUser.id}`,
				{ withCredentials: true }
			)
			.then(response => {
				if (response.data.length) {
					setOrdersUser(response.data)
				}
			})
	}, [])

	const handleSubmitProfile = handleSubmitUser(data => {
		axios
			.put(
				`${import.meta.env.VITE_BACKEND_URL}/user/${loggedUser.id}`,
				data,
				{ withCredentials: true }
			)
			.then(response => {
				setEditUser(!editUser)
				rescuingUser(response.data.id)
			})
			.catch(error => {
				console.log(error, 'algo ha salido mal con el putting del user')
			})
	})

	const handleSubmitDirection = handleSubmitAddress(data => {
		axios
			.post(
				`${import.meta.env.VITE_BACKEND_URL}/address/${loggedUser.id}`,
				data,
				{ withCredentials: true }
			)
			.then(() => {
				setEditAddress(!editAddress)
			})
			.catch(error => {
				console.log(error, 'algo ha salido mal con posting address')
			})
	})

	const deletingUser = () => {
		const confirmDelete = confirm(
			'Estás segurx de que quieres salir de nuestra órbita para siempre? 😔'
		)

		if (confirmDelete) {
			handleLogout()
			cleaningBasket()
			axios
				.delete(
					`${import.meta.env.VITE_BACKEND_URL}/user/${loggedUser.id}`,
					{ withCredentials: true }
				)
				.then(() => {
					navigate('/')
				})
				.catch(error => {
					console.log(error, 'Algo ha salido mal borrando al usuario')
				})
		} else {
			alert('Gracias por continuar con nosotrxs!!🤗')
		}
	}

	return (
		<div>
			<NavBar />
			<div className='profile-wrapper'>
				<div className='profile-container'>
					<div className='profile-title-wrapper'>
						<div className='profile-title'>Perfil</div>
						{loggedUser.admin ? (
							<div className='admin-wrapper'>
								<div>Admin User</div>
								<Link to={`/game-manager/${loggedUser.id}`}>
									<div>
										Game Manager <TbEdit className='icon-edit' />
									</div>
								</Link>
							</div>
						) : null}
					</div>
					<div className='form-wrapper'>
						<div className='form-title-wrapper'>
							<div className='universal-title'>Datos Personales</div>
							<TbEdit
								className='edit-icon'
								onClick={() => setEditUser(!editUser)}
							/>
						</div>
						<form onSubmit={handleSubmitProfile}>
							<div className='two-column'>
								<input
									type='text'
									{...registerUser('name', {
										required: {
											value: true,
											message: 'Nombre es requerido'
										},
										minLength: {
											value: 2,
											message: 'Nombre debe tener al menos 2 caracteres'
										},
										maxLength: {
											value: 50,
											message: 'Nombre debe tener como máximo 50 caracteres'
										},
										disabled: editUser
									})}
									placeholder='Nombre'
								/>
								{errorsUser.name && (
									<div className='errorTag'>{errorsUser.name.message}</div>
								)}

								<input
									type='number'
									{...registerUser('phone_number', {
										minLength: {
											value: 9,
											message: 'Teléfono debe tener 9 caracteres'
										},
										maxLength: {
											value: 9,
											message: 'Teléfono debe tener 9 caracteres'
										},
										disabled: editUser
									})}
									placeholder='Teléfono'
								/>

								{errorsUser.phone_number && (
									<div className='errorTag'>
										{errorsUser.phone_number.message}
									</div>
								)}
							</div>
							<div className='one-column'>
								<input
									type='text'
									{...registerUser('surnames', {
										minLength: {
											value: 2,
											message: 'Apellidos debe tener al menos 2 caracteres'
										},
										maxLength: {
											value: 40,
											message: 'Apellidos debe tener como máximo 40 caracteres'
										},
										disabled: editUser
									})}
									placeholder='Apellidos'
								/>

								{errorsUser.surnames && (
									<div className='errorTag'>{errorsUser.surnames.message}</div>
								)}
							</div>
							<div className='two-column'>
								<input
									type='email'
									{...registerUser('email', {
										required: {
											value: true,
											message: 'Email es requerido'
										},
										maxLength: {
											value: 50,
											message: 'Email tiene que tener como máximo 50 caracteres'
										},
										pattern: {
											value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
											message: 'Email no válido'
										},
										disabled: editUser
									})}
									placeholder='Email'
								/>

								{errorsUser.email && (
									<div className='errorTag'>{errorsUser.email.message}</div>
								)}

								<input
									type='password'
									{...registerUser('password', {
										minLength: {
											value: 6,
											message: 'Contraseña debe tener al menos 6 caracteres'
										},
										maxLength: {
											value: 200,
											message:
												'Contraseña debe tener como máximo 200 caracteres'
										},
										disabled: editUser
									})}
									placeholder='••••••••••'
								/>

								{errorsUser.password && (
									<div className='errorTag'>{errorsUser.password.message}</div>
								)}
							</div>
							<div className='button-wrapper'>
								<button disabled={editUser} type='submit'>
									Guardar
								</button>
								<div className='unsubscribe' onClick={deletingUser}>
									Darse de baja
								</div>
							</div>
						</form>
					</div>
					<div className='form-wrapper'>
						<div className='form-title-wrapper'>
							<div className='universal-title'>Dirección</div>
							<TbEdit
								className='edit-icon'
								onClick={() => setEditAddress(!editAddress)}
							/>
						</div>
						<form onSubmit={handleSubmitDirection}>
							<div className='one-column'>
								<input
									type='text'
									{...registerAddress('street', {
										required: {
											value: true,
											message: 'Dirección Línea 1 es requerido'
										},
										minLength: {
											value: 2,
											message:
												'Dirección Línea 1 debe tener al menos 2 caracteres'
										},
										maxLength: {
											value: 100,
											message:
												'Dirección Línea 1 debe tener como máximo 50 caracteres'
										},
										disabled: editAddress
									})}
									placeholder='Dirección Línea 1'
								/>

								{errorsAddress.street && (
									<div className='errorTag'>{errorsAddress.street.message}</div>
								)}
							</div>
							<div className='one-column'>
								<input
									type='text'
									{...registerAddress('second_line_street', {
										minLength: {
											value: 2,
											message:
												'Dirección Línea 2 debe tener al menos 2 caracteres'
										},
										maxLength: {
											value: 50,
											message:
												'Dirección Línea 2 debe tener como máximo 50 caracteres'
										},
										disabled: editAddress
									})}
									placeholder='Dirección Línea 2'
								/>

								{errorsAddress.second_line_street && (
									<div className='errorTag'>
										{errorsAddress.second_line_street.message}
									</div>
								)}
							</div>
							<div className='two-column'>
								<input
									type='number'
									{...registerAddress('postal_code', {
										required: {
											value: true,
											message: 'Código Postal es requerido'
										},
										minLength: {
											value: 5,
											message: 'Código Postal debe tener 5 números'
										},
										maxLength: {
											value: 5,
											message: 'Código Postal debe tener 5 números'
										},
										disabled: editAddress
									})}
									placeholder='Código Postal'
								/>

								{errorsAddress.postal_code && (
									<div className='errorTag'>
										{errorsAddress.postal_code.message}
									</div>
								)}

								<input
									type='text'
									{...registerAddress('city', {
										required: {
											value: true,
											message: 'Ciudad es requerido'
										},
										minLength: {
											value: 2,
											message: 'Ciudad debe tener al menos 2 caracteres'
										},
										maxLength: {
											value: 40,
											message: 'Ciudad debe tener como máximo 40 caracteres'
										},
										disabled: editAddress
									})}
									placeholder='Ciudad'
								/>

								{errorsAddress.city && (
									<div className='errorTag'>{errorsAddress.city.message}</div>
								)}
							</div>
							<div className='button-wrapper'>
								<button disabled={editAddress} type='submit'>
									Guardar
								</button>
							</div>
						</form>
					</div>
					{ordersUser.length ? (
						<div className='form-wrapper'>
							<div className='universal-title'>Pedidos</div>
							<div className='orders-wrapper'>
								{ordersUser.map(order => {
									return (
										<div key={order.id} className='order-item'>
											<span>{`#${order.id}`}</span>
											<div className='divs'>
												Fecha: <span>{order.date}</span>
											</div>
											<div className='divs'>
												Artículos: <span>{order.qty}</span>
											</div>
											<div className='divs'>
												Importe:{' '}
												<span>{Math.floor(order.total * 100) / 100}</span>€
											</div>
										</div>
									)
								})}
							</div>
						</div>
					) : null}
				</div>
			</div>
			<Footer />
		</div>
	)
}
