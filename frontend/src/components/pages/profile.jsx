import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'

import axios from 'axios'

import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { TbEdit } from 'react-icons/tb'

import { useLoginContext } from '../../contexts/auth-context'
import { useCartContext } from '../../contexts/cart/cart-context'

export default function Profile() {
	const { loggedUser, setLoggedUser, handleLogout } = useLoginContext()
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
			phoneNumber: loggedUser.phoneNumber
		}
	})

	const {
		register: registerAddress,
		handleSubmit: handleSubmitAddress,
		formState: { errors: errorsAddress },
		reset,
		control
	} = useForm({
		defaultValues: {
			addresses: [
				{
					id: '',
					street: '',
					secondLineStreet: '',
					postalCode: '',
					city: ''
				}
			]
		}
	})

	const [ordersUser, setOrdersUser] = useState([])
	const [addressesUser, setAddressesUser] = useState([])

	const { fields: addressFields } = useFieldArray({
		control,
		name: 'addresses'
	})

	useEffect(() => {
		if (!Object.keys(loggedUser).length) return
		if (loggedUser.addresses && loggedUser.orders) return
		axios
			.get(
				`${import.meta.env.VITE_BACKEND_URL}/users/${loggedUser.id}/with-relations`,
				{
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`
					}
				}
			)
			.then(response => {
				if (Object.keys(response.data).length) {
					setOrdersUser(response.data.orders)
					setAddressesUser(response.data.addresses)
					response.data.addresses.length && reset({ addresses: response.data.addresses })
					setLoggedUser({...response.data})
				}
			})
	}, [])

	const handleSubmitProfile = handleSubmitUser(data => {
		const confirmEdit = confirm('Quieres guardar los nuevos datos del perfil?')
		if (!confirmEdit) return
		axios
			.put(`${import.meta.env.VITE_BACKEND_URL}/users/${loggedUser.id}`, data, {
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${localStorage.getItem('access_token')}`
				}
			})
			.then(response => {
				setEditUser(!editUser)
				setLoggedUser({ ...loggedUser, ...response.data })
			})
			.catch(error => {
				console.log(error, 'algo ha salido mal con el putting del user')
			})
	})

	const handleSubmitDirection = handleSubmitAddress((data, methodHTTP) => {
		const confirmEdit = confirm(
			'Quieres guardar los nuevos datos de la dirección?'
		)
		if (!confirmEdit) return

		axios(
			`${import.meta.env.VITE_BACKEND_URL}/addresses/${methodHTTP === 'put' && data.id}`,
			data,
			{
				method: methodHTTP,
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${localStorage.getItem('access_token')}`
				}
			}
		)
			.then(response => {
				setEditAddress(!editAddress)
				setAddressesUser([...addressesUser, response.data])
				setLoggedUser({
					...loggedUser,
					addresses: [...loggedUser.addresses, response.data]
				})
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
			axios
				.delete(`${import.meta.env.VITE_BACKEND_URL}/users/${loggedUser.id}`, {
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`
					}
				})
				.then(() => {
					handleLogout()
					cleaningBasket()
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
						{loggedUser.role < 3 ? (
							<div className='admin-wrapper'>
								<Link to={`/game-manager}`}>
									<div>
										<TbEdit className='icon-edit' />
										<span>Game Manager</span>
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
											message: `El campo 'Nombre' es requerido`
										},
										minLength: {
											value: 1,
											message: `El campo 'Nombre' debe tener al menos 1 caracter`
										},
										maxLength: {
											value: 50,
											message: `El campo 'Nombre' debe tener como máximo 50 caracteres`
										},
										disabled: editUser
									})}
									placeholder='Nombre'
								/>
								{errorsUser.name && (
									<div className='errorTag'>{errorsUser.name.message}</div>
								)}

								<input
									type='text'
									{...registerUser('phoneNumber', {
										pattern: {
											value: /^(?:\+34\s?)?(6\d{8}|7[1-9]\d{7})$/,
											message: `El campo 'Teléfono' debe tener alguno de los siguientes formatos: '666666666' o '+34666666666'`
										},
										disabled: editUser
									})}
									placeholder='Teléfono'
								/>
								{errorsUser.phoneNumber && (
									<div className='errorTag'>
										{errorsUser.phoneNumber.message}
									</div>
								)}
							</div>
							<div className='one-column'>
								<input
									type='text'
									{...registerUser('surnames', {
										minLength: {
											value: 1,
											message: `El campo 'Apellidos' debe tener al menos 1 caracter`
										},
										maxLength: {
											value: 100,
											message: `El campo 'Apellidos' debe tener como máximo 100 caracteres`
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
											message: `El campo 'Email' es requerido`
										},
										maxLength: {
											value: 100,
											message: `El campo 'Email' debe tener como máximo 100 caracteres`
										},
										pattern: {
											value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
											message: `El campo 'Email' debe tener un formato como el siguiente: ejemplo@dominio.com`
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
											value: 7,
											message: `El campo 'Contraseña' debe tener al menos 7 caracteres`
										},
										maxLength: {
											value: 70,
											message: `El campo 'Contraseña' debe tener como máximo 70 caracteres`
										},
										validate: {
											value: value => {
												if (value === loggedUser.password) {
													return true
												} else {
													const regex =
														/^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{}|;:',.<>?/]){7,}$/
													return (
														regex.test(value) ||
														`El campo 'Contraseña' debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial`
													)
												}
											}
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
					{addressFields.map((address, index) => {
						console.log(address, 'address')
						return (
							<div key={address.id} className='form-wrapper'>
								<div className='form-title-wrapper'>
									<div className='universal-title'>Dirección</div>
									<TbEdit
										className='edit-icon'
										onClick={() => setEditAddress(!editAddress)}
									/>
								</div>
								{address.default && <div className='default-address'>Predeterminada</div>}
								<form onSubmit={handleSubmitDirection}>
									<div className='one-column'>
										<input
											type='text'
											{...registerAddress(`addresses.${index}.street`, {
												required: {
													value: true,
													message: `El campo 'Dirección Línea 1' es requerido`
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
										{errorsAddress.addresses?.[index]?.street && (
											<div className='errorTag'>
												{errorsAddress?.addresses[index]?.street?.message}
											</div>
										)}
									</div>
									<div className='one-column'>
										<input
											type='text'
											{...registerAddress(`addresses.${index}.secondLineStreet`, {
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

										{errorsAddress.addresses?.[index]?.secondLineStreet && (
											<div className='errorTag'>
												{errorsAddress.addresses[index].secondLineStreet.message}
											</div>
										)}
									</div>
									<div className='two-column'>
										<input
											type='number'
											{...registerAddress(`addresses.${index}.postalCode`, {
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

										{errorsAddress.addresses?.[index]?.postalCode && (
											<div className='errorTag'>
												{errorsAddress.addresses[index].postalCode.message}
											</div>
										)}

										<input
											type='text'
											{...registerAddress(`addresses.${index}.city`, {
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

										{errorsAddress.addresses?.[index]?.city && (
											<div className='errorTag'>
												{errorsAddress.addresses[index].city.message}
											</div>
										)}
									</div>
									<div className='button-wrapper'>
										<button disabled={editAddress} type='submit'>
											Guardar
										</button>
									</div>
								</form>
							</div>
						)
					})}
					{ordersUser.length ? (
						<div className='form-wrapper'>
							<div className='universal-title'>Pedidos</div>
							<div className='orders-wrapper'>
								{ordersUser.map(order => {
									return (
										<div key={order.id} className='order-item'>
											<span>{`#${order.id}`}</span>
											<div className='divs'>
												Fecha: <span>{order.createdAt}</span>
											</div>
											<div className='divs'>
												Artículos: <span>{order.items.length}</span>
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
