import { useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'

export default function FormAddress({
	setSteps,
	user,
	setUser,
	address,
	setAddress,
	loggedUser
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm({
		defaultValues: {
			name: user.name,
			surnames: user.surnames,
			phone_number: user.phone_number,
			street: address.street,
			second_line_street: address.second_line_street,
			postal_code: address.postal_code,
			city: address.city
		}
	})

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
			.catch(error => {
				console.log(error, 'algo ha salido mal con el getting de address')
			})
	}, [])

	const puttingUser = dataForm => {
		axios
			.put(
				`${import.meta.env.VITE_BACKEND_URL}/user/${loggedUser.id}`,
				{
					email: loggedUser.email,
					name: dataForm.name,
					password: '',
					admin: loggedUser.admin,
					surnames: dataForm.surnames,
					phone_number: dataForm.phone_number
				},
				{ withCredentials: true }
			)
			.then(response => {
				setUser(response.data)
			})
			.catch(error => {
				console.log(error, 'algo ha salido mal con el putting de usuario')
			})
	}

	const postingAddress = dataForm => {
		axios
			.post(
				`${import.meta.env.VITE_BACKEND_URL}/address/${loggedUser.id}`,
				{
					street: dataForm.street,
					second_line_street: dataForm.second_line_street,
					postal_code: dataForm.postal_code,
					city: dataForm.city
				},
				{ withCredentials: true }
			)
			.then(response => {
				setAddress(response.data)
			})
			.catch(error => {
				console.log(error, 'algo ha salido mal con el posting de address')
			})
	}

	// const handleChangeAddress = (event) => {
	//     setAddress({
	//         ...address,
	//         [event.target.name]: event.target.value
	//     });
	// }

	// const handleChangeUser = (event) => {
	//     setUser({
	//         ...user,
	//         [event.target.name]: event.target.value
	//     });
	// }

	// const handleSubmit = (event) => {
	//     event.preventDefault();
	//     setSteps(2);
	//     postingAddress();
	//     puttingUser();
	// }

	return (
		<div className='address-container'>
			<div className='title-checkout'>Datos Envío</div>
			<form
				className='form-address-wrapper'
				onSubmit={handleSubmit(data => {
					setSteps(2)
					postingAddress(data)
					puttingUser(data)
				})}
			>
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
