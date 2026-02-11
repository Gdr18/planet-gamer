import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { getAddressesUser, executeUserAction, executeAddressAction } from '../../services/api-client'

export default function FormAddress({
	setSteps,
	user,
	setUser,
	address,
	setAddress,
	loggedUser,
	refreshUser
}) {
	const {
		register,
		formState: { errors },
		reset
	} = useForm({
		defaultValues: {
			name: user.name,
			surnames: user.surnames,
			phoneNumber: user.phone_number,
			street: address.street,
			secondLineStreet: address.second_line_street,
			postalCode: address.postal_code,
			city: address.city
		}
	})

	useEffect(async () => {
		if (loggedUser.addresses) return

		getAddressesUser(loggedUser.id)
			.then(response => {
				const addressData = response

				if (addressData.length) {
					let addressDefault = addressData[0]
					addressData.forEach(address => {
						if (address.default) {
							addressDefault = address
						}
					})
					reset({ ...addressDefault })
					setAddress(addressDefault)
				}
			})
			.catch(async error => {
				if (error.response?.data?.err === 'expired_token') {
					await refreshUser()
					return getAddressesUser(loggedUser.id)
				}
				console.error('Error consiguiendo direcciones del usuario:', error)
			})
	}, [])

	const handleSubmit = async data => {
		setSteps(2)
		const { name, surnames, phoneNumber, ...dataAddress } = data
		if (
			dataAddress.street !== address.street ||
			dataAddress.secondLineStreet !== address.secondLineStreet ||
			dataAddress.postalCode !== address.postalCode ||
			dataAddress.city !== address.city
		) {
			const formatedData = { ...data, userId: loggedUser.id }
			executeAddressAction(formatedData, 'post')
				.then(response => {
					setAddress(response)
				})
				.catch(async error => {
					if (error.response?.data?.err === 'expired_token') {
						await refreshUser()
						return executeAddressAction(formatedData, 'post')
					}
					console.error('Error registrando dirección:', error)
				})
		}
		if (
			phoneNumber !== loggedUser.phoneNumber ||
			name !== loggedUser.name ||
			surnames !== loggedUser.surnames
		) {
			const formatedData = { ...loggedUser, name, surnames, phoneNumber }
			executeUserAction(formatedData, 'put')
				.then(response => {
					setUser(response)
				})
				.catch(async error => {
					if (error.response?.data?.err === 'expired_token') {
						await refreshUser()
						return executeUserAction(formatedData, 'put')
					}
					console.error('Error actualizando usuario:', error)
				})
		}
	}

	return (
		<div className='address-container'>
			<div className='title-checkout'>Datos Envío</div>
			<form className='form-address-wrapper' onSubmit={handleSubmit}>
				<div className='one-column'>
					<input
						type='text'
						placeholder='Name'
						{...register('name', {
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
							}
						})}
					/>

					{errors.name && <div className='errorTag'>{errors.name.message}</div>}
				</div>

				<div className='one-column'>
					<input
						type='text'
						placeholder='Apellidos'
						{...register('surnames', {
							required: {
								value: true,
								message: 'Apellidos es requerido'
							},
							minLength: {
								value: 2,
								message: 'Apellidos debe tener al menos 2 caracteres'
							},
							maxLength: {
								value: 40,
								message: 'Apellidos debe tener como máximo 50 caracteres'
							}
						})}
					/>

					{errors.surnames && (
						<div className='errorTag'>{errors.surnames.message}</div>
					)}
				</div>

				<div className='one-column'>
					<input
						type='text'
						placeholder='Dirección Línea 1'
						{...register('street', {
							required: {
								value: true,
								message: 'Dirección Línea 1 es requerido'
							},
							minLength: {
								value: 2,
								message: 'Dirección Línea 1 debe tener al menos 2 caracteres'
							},
							maxLength: {
								value: 100,
								message:
									'Dirección Línea 1 debe tener como máximo 50 caracteres'
							}
						})}
					/>

					{errors.street && (
						<div className='errorTag'>{errors.street.message}</div>
					)}
				</div>

				<div className='two-column'>
					<input
						type='text'
						placeholder='Dirección Línea 2'
						{...register('second_line_street', {
							minLength: {
								value: 2,
								message: 'Dirección Línea 2 debe tener al menos 2 caracteres'
							},
							maxLength: {
								value: 50,
								message:
									'Dirección Línea 2 debe tener como máximo 50 caracteres'
							}
						})}
					/>

					{errors.second_line_street && (
						<div className='errorTag'>{errors.second_line_street.message}</div>
					)}

					<input
						type='number'
						placeholder='Teléfono'
						{...register('phone_number', {
							required: {
								value: true,
								message: 'Teléfono es requerido'
							},
							minLength: {
								value: 9,
								message: 'Teléfono debe tener al menos 2 caracteres'
							},
							maxLength: {
								value: 9,
								message: 'Teléfono debe tener como máximo 50 caracteres'
							}
						})}
					/>

					{errors.phone_number && (
						<div className='errorTag'>{errors.phone_number.message}</div>
					)}
				</div>

				<div className='two-column'>
					<input
						type='number'
						placeholder='Código Postal'
						{...register('postal_code', {
							required: {
								value: true,
								message: 'Código Postal es requerido'
							},
							minLength: {
								value: 5,
								message: 'Código Postal debe tener al menos 5 caracteres'
							},
							maxLength: {
								value: 5,
								message: 'Código Postal debe tener como máximo 5 caracteres'
							}
						})}
					/>

					{errors.postal_code && (
						<div className='errorTag'>{errors.postal_code.message}</div>
					)}

					<input
						type='text'
						placeholder='Ciudad'
						{...register('city', {
							required: {
								value: true,
								message: 'Ciudad es requerido'
							},
							minLength: {
								value: 2,
								message: 'Ciudad debe tener al menos 2 caracteres'
							},
							maxLength: {
								value: 50,
								message: 'Ciudad debe tener como máximo 40 caracteres'
							}
						})}
					/>

					{errors.city && <div className='errorTag'>{errors.city.message}</div>}
				</div>
				<div className='button-direction'>
					<button type='submit '>Siguiente</button>
				</div>
			</form>
		</div>
	)
}
