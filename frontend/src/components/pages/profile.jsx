import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'

import {
	executeUserAction,
	getUserWithRelatedData
} from '../../services/api/user-service'
import { executeAddressAction } from '../../services/api/address-service'

import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { TbEdit } from 'react-icons/tb'

import { useLoginContext } from '../../contexts/auth-context'
import { useCartContext } from '../../contexts/cart/cart-context'
import { useErrorContext } from '../../contexts/error-context'

export default function Profile() {
	const { loggedUser, setLoggedUser, logoutUser } = useLoginContext()
	const { cleaningBasket } = useCartContext()
	const { setError } = useErrorContext()

	const navigate = useNavigate()

	const [editUser, setEditUser] = useState(true)
	const [editAddress, setEditAddress] = useState([])
	const [successMessageAddress, setSuccessMessageAddress] = useState('')
	const [successMessageProfile, setSuccessMessageProfile] = useState('')

	const {
		register: registerUser,
		handleSubmit: handleSubmitUser,
		formState: { errors: errorsUser }
	} = useForm({
		defaultValues: {
			id: loggedUser.id,
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
					city: '',
					default: false
				}
			]
		}
	})

	const { fields: addressFields } = useFieldArray({
		control,
		name: 'addresses'
	})

	useEffect(() => {
		if (!loggedUser.addresses && !loggedUser.orders) {
			getUserWithRelatedData(loggedUser.id)
				.then(user => {
					if (Object.keys(user).length) {
						setLoggedUser({ ...user })
					}
				})
				.catch(error => {
					setError(error)
				})
		}
	}, [loggedUser.id])

	useEffect(() => {
		if (loggedUser.addresses?.length) {
			reset({ addresses: loggedUser.addresses })
			setEditAddress(new Array(loggedUser.addresses.length).fill(true))
		} else {
			setEditAddress([true])
		}
	}, [loggedUser.addresses])

	useEffect(() => {
		if (Object.keys(loggedUser).length) return
		navigate('/')
	}, [loggedUser.id])

	const handleSubmitProfile = handleSubmitUser(async data => {
		const confirmEdit = confirm('Quieres guardar los nuevos datos del perfil?')
		if (!confirmEdit) return

		await executeUserAction({ ...data, password: loggedUser.password }, 'put')
			.then(user => {
				setEditUser(!editUser)
				setLoggedUser({ ...loggedUser, ...user })
				setSuccessMessageProfile(
					'Los datos del perfil han sido actualizados correctamente.'
				)
				setTimeout(() => {
					setSuccessMessageProfile('')
				}, 3000)
			})
			.catch(error => {
				setError(error)
			})
	})

	const handleSubmitDirection = index =>
		handleSubmitAddress(async data => {
			const confirmEdit = confirm(
				'Quieres guardar los nuevos datos de la dirección?'
			)
			if (!confirmEdit) return

			const currentAddress = { ...data.addresses[index], userId: loggedUser.id }
			const methodHTTP = currentAddress.id ? 'put' : 'post'

			await executeAddressAction(currentAddress, methodHTTP)
				.then(address => {
					setEditAddress(prev => {
						const next = [...prev]
						next[index] = !next[index]
						return next
					})
					setLoggedUser(prev => ({
						...prev,
						addresses: prev.addresses
							? prev.addresses.map((addr, i) => (i === index ? address : addr))
							: [address]
					}))
					setSuccessMessageAddress(
						'Los datos de la dirección han sido actualizados correctamente.'
					)
					setTimeout(() => {
						setSuccessMessageAddress('')
					}, 3000)
				})
				.catch(error => {
					setError(error)
				})
		})

	const deletingUser = async () => {
		const confirmDelete = confirm(
			'Estás segurx de que quieres salir de nuestra órbita para siempre? 😔'
		)

		if (confirmDelete) {
			await executeUserAction(loggedUser, 'delete')
				.then(() => {
					logoutUser()
					cleaningBasket()
					navigate('/')
				})
				.catch(error => {
					setError(error)
				})
		} else {
			alert('Gracias por continuar con nosotrxs!!🤗')
		}
	}

	return (
		<div>
			{/* {console.log(loggedUser)} */}
			<NavBar />
			<div className='profile-wrapper'>
				<div className='profile-container'>
					<div className='profile-title-wrapper'>
						<div className='profile-title'>Perfil</div>
						{loggedUser.role < 3 && (
							<div className='admin-wrapper'>
								<Link to={'/game-manager'}>
									<div>
										<TbEdit className='icon-edit' />
										<span>Game Manager</span>
									</div>
								</Link>
							</div>
						)}
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
												if (value === loggedUser.password || value === '') {
													return true
												} else {
													const regex =
														/^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{}|;:',.<>?/]).{7,}$/
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

								{successMessageProfile && (
									<div className='success-message'>{successMessageProfile}</div>
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
						return (
							<div key={address.id} className='form-wrapper'>
								<div className='form-title-wrapper'>
									<div className='universal-title'>Dirección</div>
									<TbEdit
										className='edit-icon'
										onClick={() =>
											setEditAddress(prev => {
												const next = [...prev]
												next[index] = !next[index]
												return next
											})
										}
									/>
								</div>
								<form onSubmit={handleSubmitDirection(index)}>
									<div className='checkbox-default'>
										<label htmlFor={`default-${index}`}>Predeterminada</label>
										<input
											type='checkbox'
											id={`default-${index}`}
											{...registerAddress(`addresses.${index}.default`, {
												value: address.default,
												disabled: editAddress[index]
											})}
										/>
									</div>
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
														'Dirección Línea 1 debe tener como máximo 100 caracteres'
												},
												disabled: editAddress[index]
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
											{...registerAddress(
												`addresses.${index}.secondLineStreet`,
												{
													minLength: {
														value: 2,
														message:
															'Dirección Línea 2 debe tener al menos 2 caracteres'
													},
													maxLength: {
														value: 50,
														message:
															'Dirección Línea 2 debe tener como máximo 100 caracteres'
													},
													disabled: editAddress[index]
												}
											)}
											placeholder='Dirección Línea 2'
										/>

										{errorsAddress.addresses?.[index]?.secondLineStreet && (
											<div className='errorTag'>
												{
													errorsAddress.addresses[index].secondLineStreet
														.message
												}
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
												disabled: editAddress[index]
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
												disabled: editAddress[index]
											})}
											placeholder='Ciudad'
										/>

										{errorsAddress.addresses?.[index]?.city && (
											<div className='errorTag'>
												{errorsAddress.addresses[index].city.message}
											</div>
										)}

										{successMessageAddress && (
											<div className='success-message'>
												{successMessageAddress}
											</div>
										)}
									</div>
									<div className='button-wrapper'>
										<button disabled={editAddress[index]} type='submit'>
											Guardar
										</button>
									</div>
								</form>
							</div>
						)
					})}

					{loggedUser.orders?.length > 0 && (
						<div className='form-wrapper'>
							<div className='universal-title'>Pedidos</div>
							<div className='orders-wrapper'>
								{loggedUser.orders.map(order => {
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
					)}
				</div>
			</div>
			<Footer />
		</div>
	)
}
