import { TbEdit, TbDelete } from 'react-icons/tb'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'

import NavBar from '../nav-bar/NavBar'
import Footer from '../Footer'

import { useAuthContext } from '../../contexts/AuthContext'

import { useApiWithErrors } from '../../hooks/useApiWithErrors'

import {
	getUserRoles,
	executeUserRoleAction
} from '../../services/api/user-service'

const RolesManager = () => {
	const { currentUserRoles, setCurrentUserRoles } = useAuthContext()
	const [successMessage, setSuccessMessage] = useState('')

	const { callApi } = useApiWithErrors()

	useEffect(() => {
		if (!currentUserRoles.length) {
			callApi(() => getUserRoles()).then(({ ok, response: roles }) => {
				if (ok) {
					setCurrentUserRoles(roles)
				}
			})
		}
	}, [])

	const {
		register: registerRoleUser,
		handleSubmit: handleSubmitRoleUser,
		formState: { errors: errorsUser },
		getValues,
		reset: resetRoleUser
	} = useForm({
		defaultValues: {
			id: null,
			email: '',
			role: ''
		}
	})

	const handleSubmit = handleSubmitRoleUser(data => {
		// Handle form submission
	})

	const handleDelete = userRole => {
		callApi(() => executeUserRoleAction('delete', userRole)).then(({ ok }) => {
			if (ok) {
				setCurrentUserRoles(
					currentUserRoles.filter(role => role.id !== userRole.id)
				)
			}
		})
	}
	return (
		<div>
			<NavBar />
			<div className='profile-wrapper'>
				<div className='profile-container'>
					<div className='profile-title-wrapper'>
						<div className='profile-title'>Gestión de Roles</div>
					</div>
					<div className='form-wrapper'>
						<form onSubmit={handleSubmit}>
							<div className='two-column'>
								<input
									type='email'
									{...registerRoleUser('email', {
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
									disabled={getValues('id')}
								/>
								{errorsUser.email && (
									<div className='errorTag'>{errorsUser.email.message}</div>
								)}

								<select
									type='text'
									{...registerRoleUser('role', {
										required: {
											value: true,
											message: `El campo 'Rol' es requerido`
										}
									})}
									placeholder='Rol'
								>
									<option value=''>Seleccionar Rol</option>
									<option value='admin'>Administrador</option>
									<option value='staff'>Equipo</option>
									<option value='customer'>Cliente</option>
								</select>
								{errorsUser.role && (
									<div className='errorTag'>{errorsUser.role.message}</div>
								)}

								{successMessage && (
									<div className='success-message'>{successMessage}</div>
								)}
							</div>
							<div className='button-wrapper'>
								<button type='submit'>Guardar</button>
							</div>
						</form>
					</div>
					<div className='universal-title'>
						Roles de Usuario
						{currentUserRoles.map(userRole => {
							return (
								<div key={userRole.id} className='form-wrapper'>
									<div className='form-title-wrapper'>
										<div className='user-role-wrapper'>
                                            <span>{userRole.email}</span>
                                            <span>{userRole.role}</span>
											<span
												className='edit-container'
												onClick={() =>
													resetRoleUser({
														id: userRole.id,
														email: userRole.email,
														role: userRole.role
													})
												}
											>
												<TbEdit className='edit-icon' />
											</span>
											<span
												className='delete-container'
												onClick={() => handleDelete(userRole)}
											>
												<TbDelete className='delete-icon' />
											</span>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}

export default RolesManager
