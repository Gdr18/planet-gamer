import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { RotatingLines } from 'react-loader-spinner'

import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { useCartContext } from '../../contexts/cart-context'

export default function Game() {
	const params = useParams()
	const idGame = params.game
	const [gameComplete, setGameComplete] = useState({})
	const [loading, setLoading] = useState(true)

	const { handleGamesBasket } = useCartContext()

	useEffect(() => gettingGame(), [])

	const gettingGame = () => {
		axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/games/${idGame}`, {
				withCredentials: true
			})
			.then(response => {
				setGameComplete(response.data)
				setLoading(false)
			})
			.catch(error => {
				console.log('An error ocurred', error)
			})
	}

	return (
		<div className='game-page'>
			<NavBar />
			<div className={loading ? 'spinner-class' : 'game-page-container'}>
				{loading ? (
					<RotatingLines
						strokeColor='#5de659'
						strokeWidth='5'
						animationDuration='0.75'
						width='96'
						visible={true}
					/>
				) : (
					<div className='game-page-wrapper'>
						<div className='image-wrapper'>
							<img src={gameComplete.imgUrl} alt={gameComplete.title}></img>
							<div className='details-wrapper'>
								<div>
									<strong>Platform:</strong> {gameComplete.platform}
								</div>
								<div>
									<strong>Género:</strong> {gameComplete.gender}
								</div>
								<div>
									<strong>Lanzamiento:</strong> {gameComplete.release}
								</div>
								<div>
									<strong>PEGI:</strong> {gameComplete.pegi}
								</div>
							</div>
						</div>
						<div className='text-wrapper'>
							<div className='title-game-page'>{gameComplete.title}</div>
							<p className='description-wrapper'>{gameComplete.description}</p>
							<div className='price-button-wrapper'>
								<h3>{`${gameComplete.price}€`}</h3>
								<button onClick={() => handleGamesBasket(gameComplete)}>
									Añadir
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			<Footer />
		</div>
	)
}
