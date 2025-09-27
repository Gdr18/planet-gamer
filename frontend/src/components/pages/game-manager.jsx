import { useState } from 'react'
import axios from 'axios'

import GameSidebarList from '../games-manager/game-sidebar-list'
import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { useCartContext } from '../../contexts/cart-context'

export default function GameManager() {
	const { getGames } = useCartContext()

	const [gamesForm, setGamesForm] = useState({
		title: '',
		description: '',
		platform: '',
		platformUrl: '',
		gender: '',
		pegi: '',
		release: '',
		price: '',
		img: ''
	})

	const [apiUrl, setApiUrl] = useState(
		`${import.meta.env.VITE_BACKEND_URL}/game`
	)
	const [apiAction, setApiAction] = useState('post')

	const clearForm = () => {
		setGamesForm({
			title: '',
			description: '',
			platform: '',
			platformUrl: '',
			gender: '',
			pegi: '',
			release: '',
			price: '',
			img: ''
		})
	}

	const handleSubmit = event => {
		axios({
			method: apiAction,
			url: apiUrl,
			data: gamesForm,
			withCredentials: true
		})
			.then(() => {
				clearForm()
				setApiUrl(
					`${import.meta.env.VITE_BACKEND_URL}/game`
				)
				setApiAction('post')
				getGames()
			})
			.catch(error => {
				console.log('game form handleSubmit error', error)
			})

		event.preventDefault()
	}

	const handleEditClick = game => {
		const {
			id,
			title,
			platform,
			platformUrl,
			description,
			gender,
			pegi,
			release,
			price,
			img
		} = game

		setGamesForm({
			title,
			description,
			gender,
			platform,
			platformUrl,
			pegi,
			release,
			price,
			img
		})

		setApiUrl(
			`${import.meta.env.VITE_BACKEND_URL}/game/${id}`
		)
		setApiAction('put')
	}

	const handleDeleteClick = game => {
		axios
			.delete(
				`${import.meta.env.VITE_BACKEND_URL}/game/${game.id}`,
				{ withCredentials: true }
			)
			.then(() => {
				getGames()
			})
			.catch(error => {
				console.log('handleDeleteClick error', error)
			})
	}

	const handleChange = event => {
		setGamesForm({
			...gamesForm,
			[event.target.name]: event.target.value
		})
	}

	return (
		<div>
			<NavBar />
			<div className='game-manager-container'>
				<div className='game-manager-wrapper'>
					<div className='left-column'>
						<div className='header-manager'>Game Manager</div>
						<form onSubmit={handleSubmit} className='game-form-wrapper'>
							<div className='one-column'>
								<input
									type='text'
									name='title'
									placeholder='Título'
									value={gamesForm.title}
									onChange={handleChange}
									required
								/>
							</div>

							<div className='two-column'>
								<input
									type='text'
									name='gender'
									placeholder='Género'
									value={gamesForm.gender}
									onChange={handleChange}
									required
								/>

								<input
									type='text'
									name='img'
									placeholder='Url Imagen'
									value={gamesForm.img}
									onChange={handleChange}
									required
								/>
							</div>

							<div className='three-column'>
								<input
									type='text'
									name='pegi'
									placeholder='PEGI'
									value={gamesForm.pegi}
									onChange={handleChange}
									maxLength={3}
									required
								/>

								<input
									type='number'
									name='price'
									placeholder='Precio'
									value={gamesForm.price}
									onChange={handleChange}
									required
								/>

								<input
									type='text'
									name='release'
									placeholder='Año Lanzamiento'
									value={gamesForm.release}
									onChange={handleChange}
									maxLength={4}
									required
								/>
							</div>

							<div className='two-column'>
								<select
									name='platform'
									value={gamesForm.platform}
									onChange={handleChange}
									className='select-element'
									required
								>
									<option value=''>Seleccione plataforma</option>
									<option value='PlayStation 4'>PlayStation 4</option>
									<option value='PlayStation 5'>PlayStation 5</option>
									<option value='Xbox Series'>Xbox Series</option>
									<option value='Nintendo Switch'>Nintendo Switch</option>
								</select>

								<select
									name='platformUrl'
									value={gamesForm.platformUrl}
									onChange={handleChange}
									className='select-element'
									required
								>
									<option value=''>Seleccione de nuevo la plataforma</option>
									<option value='ps4'>PlayStation 4</option>
									<option value='ps5'>PlayStation 5</option>
									<option value='xbox'>Xbox Series</option>
									<option value='switch'>Nintendo Switch</option>
								</select>
							</div>

							<div className='one-column'>
								<textarea
									type='text'
									name='description'
									placeholder='Description'
									value={gamesForm.description}
									onChange={handleChange}
									required
								/>
							</div>

							<div className='buttons-manager'>
								<button className='btn' type='submit'>
									Guardar
								</button>
								<button className='btn' onClick={clearForm}>
									Limpiar Formulario
								</button>
							</div>
						</form>
					</div>

					<div className='right-column'>
						<GameSidebarList
							handleDeleteClick={handleDeleteClick}
							handleEditClick={handleEditClick}
						/>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}
