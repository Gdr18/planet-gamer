import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import GameSidebarList from '../games-manager/game-sidebar-list'
import NavBar from '../../nav-bar/nav-bar'
import Footer from '../../footer'

import { GENDERS } from '../../../core/accepted-genders'
import { PLATFORM_API_MAP } from '../../../core/platform-api-map'

import { executeGameAction } from '../../../services/api/game-service'

import { useGamesContext } from '../../../contexts/games-context'
import { useErrorContext } from '../../../contexts/error-context'

export default function GamesManager() {
	const { games, setGames, getGames } = useGamesContext()
	const { setError } = useErrorContext()

	const [selectedPlatform, setSelectedPlatform] = useState('PlayStation 4')

	const initialValuesForm = {
		id: null,
		title: '',
		description: '',
		platform: '',
		gender: '',
		pegi: '',
		release: '',
		price: '',
		imgUrl: '',
		stock: ''
	}

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm({
		defaultValues: initialValuesForm
	})

	useEffect(() => {
		handlePlatformChange('PlayStation 4')
	}, [])

	const handlePlatformChange = async platform => {
		setSelectedPlatform(platform)
		const existPlatform = games.some(game => game.platform === platform)
		if (!existPlatform) {
			await getGames(PLATFORM_API_MAP[platform])
		}
	}

	const handleSubmitGameForm = handleSubmit(async data => {
		const method = data.id ? 'put' : 'post'
		await executeGameAction(method, data)
			.then(game => {
				reset(initialValuesForm)
				if (method === 'post') {
					setGames([...games, game])
				} else {
					const provGames = games.filter(oldGame => oldGame.id !== game.id)
					setGames([...provGames, game])
				}
			})
			.catch(error => {
				setError(error)
			})
	})

	const handleEditClick = game => {
		reset({ ...game })
	}

	const handleDeleteClick = game => {
		executeGameAction('delete', game)
			.then(() => {
				const updatedGames = games.filter(oldGame => oldGame.id !== game.id)
				setGames(updatedGames)
			})
			.catch(error => {
				setError(error)
			})
	}

	const filteredGames = games.filter(game => game.platform === selectedPlatform)

	return (
		<div>
			<NavBar />
			<div className='game-manager-container'>
				<div className='game-manager-wrapper'>
					<div className='left-column'>
						<div className='header-manager'>Game Manager</div>
						<form onSubmit={handleSubmitGameForm} className='game-form-wrapper'>
							<div className='one-column'>
								<input
									type='text'
									placeholder='Título'
									{...register('title', {
										required: {
											value: true,
											message: "El campo 'Título' es requerido"
										},
										maxLength: {
											value: 50,
											message:
												"El campo 'Título' no puede exceder los 50 caracteres"
										}
									})}
								/>
								{errors.title && (
									<div className='errorTag'>{errors.title.message}</div>
								)}
							</div>

							<div className='two-column'>
								<select
									type='text'
									placeholder='Género'
									{...register('gender', {
										required: {
											value: true,
											message: "El campo 'Género' es requerido"
										}
									})}
								>
									<option value=''>Selecciona un género</option>
									{GENDERS.map(gender => (
										<option key={gender} value={gender}>
											{gender}
										</option>
									))}
								</select>
								{errors.gender && (
									<div className='errorTag'>{errors.gender.message}</div>
								)}

								<select
									name='platform'
									className='select-element'
									{...register('platform', {
										required: {
											value: true,
											message: "El campo 'Plataforma' es requerido"
										}
									})}
								>
									<option value=''>Selecciona una plataforma</option>
									{Object.keys(PLATFORM_API_MAP).map(platform => (
										<option key={platform} value={platform}>
											{platform}
										</option>
									))}
								</select>
								{errors.platform && (
									<div className='errorTag'>{errors.platform.message}</div>
								)}
							</div>
							<div className='one-column'>
								<input
									type='text'
									placeholder='URL Imagen'
									{...register('imgUrl', {
										required: {
											value: true,
											message: "El campo 'URL imagen' es requerido"
										},
										pattern: {
											value: /^https?:\/\/\S+/,
											message: 'Ingrese una URL válida'
										}
									})}
								/>
								{errors.imgUrl && (
									<div className='errorTag'>{errors.imgUrl.message}</div>
								)}
							</div>

							<div className='three-column'>
								<input
									type='number'
									placeholder='PEGI'
									{...register('pegi', {
										required: {
											value: true,
											message: "El campo 'PEGI' es requerido"
										},
										pattern: {
											value: /^(\+3|\+7|\+12|\+16|\+18)$/,
											message:
												"El campo 'PEGI' debe ser uno de los siguientes valores: +3, +7, +12, +16, +18"
										}
									})}
								/>
								{errors.pegi && (
									<div className='errorTag'>{errors.pegi.message}</div>
								)}

								<input
									type='number'
									placeholder='Precio'
									step='0.01'
									{...register('price', {
										required: {
											value: true,
											message: "El campo 'Precio' es requerido"
										},
										min: {
											value: 0.1,
											message:
												"El campo 'Precio' debe ser un entero positivo mayor que 0"
										}
									})}
								/>
								{errors.price && (
									<div className='errorTag'>{errors.price.message}</div>
								)}

								<input
									type='text'
									placeholder='Año Lanzamiento'
									{...register('release', {
										required: {
											value: true,
											message: "El campo 'Año de lanzamiento' es requerido"
										},
										min: {
											value: 1975,
											message:
												"El campo 'Año de lanzamiento' debe ser mayor o igual a 1975"
										},
										max: {
											value: new Date().getFullYear(),
											message: `El campo 'Año de lanzamiento' debe ser menor o igual a ${new Date().getFullYear()}`
										}
									})}
								/>
								{errors.release && (
									<div className='errorTag'>{errors.release.message}</div>
								)}
							</div>

							<div className='one-column'>
								<textarea
									type='text'
									placeholder='Descripción'
									{...register('description', {
										required: {
											value: true,
											message: "El campo 'Descripción' es requerido"
										},
										minLength: {
											value: 10,
											message:
												"El campo 'Descripción' debe tener al menos 10 caracteres"
										},
										maxLength: {
											value: 2000,
											message:
												"El campo 'Descripción' no puede exceder los 2000 caracteres"
										}
									})}
								/>
								{errors.description && (
									<div className='errorTag'>{errors.description.message}</div>
								)}
							</div>

							<div className='buttons-manager'>
								<button className='btn' type='submit'>
									Guardar
								</button>
								<button className='btn' type='button' onClick={() => reset(initialValuesForm)}>
									Limpiar Formulario
								</button>
							</div>
						</form>
					</div>

					<div className='right-column'>
						<select
							name='platform'
							className='select-element'
							value={selectedPlatform}
							onChange={event => handlePlatformChange(event.target.value)}
						>
							{Object.keys(PLATFORM_API_MAP).map(platform => (
								<option
									key={platform}
									value={platform}
								>
									{platform}
								</option>
							))}
						</select>
						<GameSidebarList
							handleDeleteClick={handleDeleteClick}
							handleEditClick={handleEditClick}
							games={filteredGames}
						/>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}
