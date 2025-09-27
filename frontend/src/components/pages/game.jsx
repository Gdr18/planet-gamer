import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { RotatingLines } from 'react-loader-spinner'

import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { useCartContext } from '../../contexts/cart-context'
import { useLoginContext } from '../../contexts/login-context'

export default function Game() {
	const params = useParams()
	const idGame = params.game
	const [gameComplete, setGameComplete] = useState({})
	const [loading, setLoading] = useState(true)

	const { handleGamesBasket } = useCartContext()
	const { loggedUser } = useLoginContext()

	useEffect(() => gettingGame(), [])

	const gettingGame = () => {
		axios
			.get(
				`${import.meta.env.VITE_BACKEND_URL}/game/${idGame}`,
				{ withCredentials: true }
			)
			.then(response => {
				setGameComplete(response.data)
				setLoading(false)
			})
			.catch(error => {
				console.log('An error ocurred', error)
			})
	}

	return (
		<div>
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
							<img src={gameComplete.img}></img>
							<div className='details-wrapper'>
								<div>{`Platform: ${gameComplete.platform}`}</div>
								<div>{`Género: ${gameComplete.gender}`}</div>
								<div>{`Lanzamiento: ${gameComplete.release}`}</div>
								<div>{`PEGI: ${gameComplete.pegi}`}</div>
							</div>
							<h3>{`${gameComplete.price}€`}</h3>
							<button onClick={() => handleGamesBasket(gameComplete, loggedUser.id)}>
								Añadir
							</button>
						</div>
						<div className='text-wrapper'>
							<div className='title-game-page'>{gameComplete.title}</div>
							<p className='description-wrapper'>{gameComplete.description}</p>
						</div>
					</div>
				)}
			</div>
			<Footer />
		</div>
	)
}
