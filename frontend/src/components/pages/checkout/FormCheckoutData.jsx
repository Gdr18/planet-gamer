import { useForm } from 'react-hook-form'

export default function FormCheckoutData({ defaultFormValues, handleSubmitFormCheckout }) {
	const {
		register,
		formState: { errors },
		handleSubmit
	} = useForm({
		defaultValues: defaultFormValues
	})

	return (
		<div className='address-container'>
			<div className='title-checkout'>Datos Envío</div>
			<form className='form-address-wrapper' onSubmit={handleSubmit(handleSubmitFormCheckout)}>
				<div className='checkbox-default'>
					<input type="checkbox" id="default"{...register('isDefaultAddress', {
						value: defaultFormValues.isDefaultAddress,
					})} />
					<label htmlFor="default">Dirección por defecto</label>
				</div>
				<div className='one-column'>
					<input
						type='text'
						placeholder='Name'
						{...register('name', {
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
								message: `El campo 'Apellidos' es requerido`
							},
							minLength: {
								value: 1,
								message: `El campo 'Apellidos' debe tener como mínimo 1 caracter`
							},
							maxLength: {
								value: 100,
								message: `El campo 'Apellidos' debe tener como máximo 100 caracteres`
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
						placeholder='Calle, número'
						{...register('street', {
							required: {
								value: true,
								message: `El campo 'Calle, número' es requerido`
							},
							minLength: {
								value: 1,
								message: `El campo 'Calle, número' debe tener como mínimo 1 caracter`
							},
							maxLength: {
								value: 100,
								message:
									`El campo 'Calle, número' debe tener como máximo 100 caracteres`
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
						placeholder='Bloque, escalera, piso, puerta...'
						{...register('secondLineStreet', {
							minLength: {
								value: 1,
								message: `El campo 'Bloque, escalera, piso, puerta...' debe tener como mínimo 1 caracter`
							},
							maxLength: {
								value: 50,
								message:
									`El campo 'Bloque, escalera, piso, puerta...' debe tener como máximo 50 caracteres`
							}
						})}
					/>

					{errors.secondLineStreet && (
						<div className='errorTag'>{errors.secondLineStreet.message}</div>
					)}

					<input
						type='number'
						placeholder='Teléfono'
						{...register('phoneNumber', {
							required: {
								value: true,
								message: `El campo 'Teléfono' es requerido`
							},
							pattern: {
								value: /^(?:\+34\s?)?(6\d{8}|7[1-9]\d{7})$/,
								message: `El campo 'Teléfono' no cumple con el patrón, ejemplos válidos: '666666666' o '+34666666666'`
							},
						})}
					/>

					{errors.phoneNumber && (
						<div className='errorTag'>{errors.phoneNumber.message}</div>
					)}
				</div>

				<div className='two-column'>
					<input
						type='number'
						placeholder='Código Postal'
						{...register('postalCode', {
							required: {
								value: true,
								message: `El campo 'Código Postal' es requerido`
							},
							pattern: {
								value: /^\d{5}$/,
								message: `El campo 'Código Postal' debe tener 5 dígitos`
							}
						})}
					/>

					{errors.postalCode && (
						<div className='errorTag'>{errors.postalCode.message}</div>
					)}

					<input
						type='text'
						placeholder='Ciudad'
						{...register('city', {
							required: {
								value: true,
								message: `El campo 'Ciudad' es requerido`
							},
							minLength: {
								value: 1,
								message: `El campo 'Ciudad' debe tener como mínimo 1 caracter`
							},
							maxLength: {
								value: 40,
								message: `El campo 'Ciudad' debe tener como máximo 40 caracteres`
							}
						})}
					/>

					{errors.city && <div className='errorTag'>{errors.city.message}</div>}
				</div>
				<div className='button-direction'>
					<button type='submit'>Siguiente</button>
				</div>
			</form>
		</div>
	)
}
