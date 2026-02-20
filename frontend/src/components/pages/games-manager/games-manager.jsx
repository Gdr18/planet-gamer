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

	const [filteredGames, setFilteredGames] = useState([])

	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
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
	})

	useEffect(() => {
		const initialPlatform = 'PlayStation 4'
		handlePlatformChange(initialPlatform)
	}, [])

	const handlePlatformChange = async platform => {
		const existPlatform = games.some(game => game.platform === platform)
		if (existPlatform) {
			const newArrayGames = games.filter(game => game.platform === platform)
			setFilteredGames(newArrayGames)
		} else {
			setFilteredGames(await getGames(PLATFORM_API_MAP[platform]))
		}
	}

	const handleSubmitGameForm = handleSubmit(async data => {
		const method = data.id ? 'put' : 'post'
		await executeGameAction(method, data)
			.then(game => {
				reset()
				setGames([...games, game])
				setFilteredGames([...filteredGames, game])
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
				const updatedGames = games.filter(g => g.id !== game.id)
				setGames(updatedGames)
			})
			.catch(error => {
				setError(error)
			})
	}

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
											message: "El campo 'Título' no puede exceder los 50 caracteres"
										}
									})}
								/>
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
									<option value="">Selecciona un género</option>
									{GENDERS.map(gender => (
										<option key={gender} value={gender}>
											{gender}
										</option>
									))}
								</select>

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
											message: "Ingrese una URL válida"
										}
									})}
								/>
							</div>

							<div className='three-column'>
								<input
									type='text'
									placeholder='PEGI'
									{...register('pegi', {
										required: {
											value: true,
											message: "El campo 'PEGI' es requerido"
										},
										pattern: {
											value: /^(3|7|12|16|18)$/,
											message: "El campo 'PEGI' debe ser uno de los siguientes valores: 3, 7, 12, 16, 18"
										}
									})}
								/>

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
											message: "El campo 'Precio' debe ser un entero positivo mayor que 0"
										}
									})}
								/>

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
											message: "El campo 'Año de lanzamiento' debe ser mayor o igual a 1975"
										},
										max: {
											value: new Date().getFullYear(),
											message: `El campo 'Año de lanzamiento' debe ser menor o igual a ${new Date().getFullYear()}`
										}
									})	
										}

								/>
							</div>

							<div className='two-column'>
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
									<option value="">Selecciona una plataforma</option>
									{Object.keys(PLATFORM_API_MAP).map(platform => (
										<option key={platform} value={platform}>
											{platform}
										</option>
									))}
								</select>
							</div>

							<div className='one-column'>
								<textarea
									type='text'
									placeholder='Description'
									{...register('description', {
										required: {
											value: true,
											message: "El campo 'Descripción' es requerido"
										},
										minLength: {
											value: 10,
											message: "El campo 'Descripción' debe tener al menos 10 caracteres"
										},
										maxLength: {
											value: 2000,
											message: "El campo 'Descripción' no puede exceder los 2000 caracteres"
										}
									})}
								/>
							</div>

							<div className='buttons-manager'>
								<button className='btn' type='submit'>
									Guardar
								</button>
								<button className='btn' onClick={reset}>
									Limpiar Formulario
								</button>
							</div>
						</form>
					</div>

					<div className='right-column'>
						<select
							name='platform'
							className='select-element'
							onChange={event => handlePlatformChange(event.target.value)}
						>
							{Object.keys(PLATFORM_API_MAP).map(platform => (
								<option key={platform} value={platform} defaultValue={platform === 'PlayStation 4'}>
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
