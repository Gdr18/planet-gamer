import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { RotatingLines } from 'react-loader-spinner'
import { BsFilterLeft } from 'react-icons/bs'

import Checkbox from '../products/checkbox'
import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'

import { useCartContext } from '../../contexts/cart/cart-context'
import { useGamesContext } from '../../contexts/games-context'

export default function Products() {
	const params = useParams()
	const platform = params.platform
	const [gamesPlatform, setGamesPlatform] = useState({
		ps5: false,
		ps4: false,
		xbox: false,
		switch: false
	})
	const [filteringGames, setFilteringGames] = useState([])
	const [filterIcon, setFilterIcon] = useState(false)
	const [loading, setLoading] = useState(true)

	const { addItemBasket } = useCartContext()
	const { games, getGames } = useGamesContext()

	const platformMap = {
		ps4: 'PlayStation 4',
		ps5: 'PlayStation 5',
		xbox: 'Xbox Series',
		switch: 'Nintendo Switch'
	}

	useEffect(() => {
		getGames(platform)
		setLoading(false)
	}, [platform])

	const handleCheckbox = ({ target }) => {
		setGamesPlatform({
			...gamesPlatform,
			[target.value]: !gamesPlatform[target.value]
		})
		if (target.checked) {
			const gamesList = games.filter(
				game => game.platform === platformMap[target.value]
			)
			setFilteringGames([...filteringGames, ...gamesList])
		} else {
			if (!target.checked && platform === target.value) {
				return null
			} else {
				const gamesList = filteringGames.filter(
					game => game.platform !== platformMap[target.value]
				)
				setFilteringGames([...gamesList])
			}
		}
	}

	return (
		<>
			<NavBar />
			<div className={loading ? 'spinner-class' : 'products-container'}>
				{loading ? (
					<RotatingLines
						strokeColor='#5de659'
						strokeWidth='5'
						animationDuration='0.75'
						width='96'
						visible={true}
					/>
				) : (
					<div className='products-box'>
						<div className='filter-sorter'>
							<div className='filter-box'>
								<label
									onClick={() => {
										setFilterIcon(!filterIcon)
									}}
								>
									<BsFilterLeft className='filter-icon' />
									Filtrar
								</label>
								{filterIcon ? (
									<div className='checkbox'>
										<label>Platform</label>
										<Checkbox
											name='PlayStation 5'
											value='ps5'
											checked={gamesPlatform.ps5 || platform === 'ps5'}
											setChecked={handleCheckbox}
										/>
										<Checkbox
											name='PlayStation 4'
											value='ps4'
											checked={gamesPlatform.ps4 || platform === 'ps4'}
											setChecked={handleCheckbox}
										/>
										<Checkbox
											name='Xbox Series'
											value='xbox'
											checked={gamesPlatform.xbox || platform === 'xbox'}
											setChecked={handleCheckbox}
										/>
										<Checkbox
											name='Nintendo Switch'
											value='switch'
											checked={gamesPlatform.switch || platform === 'switch'}
											setChecked={handleCheckbox}
										/>
									</div>
								) : null}
							</div>
						</div>
						<div className='products-wrapper'>
							{games.map(game => {
								return (
									<div key={game.id} className='game-item'>
										<div className='game-img'>
											<Link to={`/game/${game.id}`}>
												<img src={game.imgUrl} />
											</Link>
											<div className="title-price">
												<Link to={`/game/${game.id}`} className='title'><strong>{game.title}</strong></Link>
												<div className='price'>{`${game.price}€`}</div>
											</div>
											<button onClick={() => addItemBasket(game)}>
												Añadir
											</button>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</div>
			{!loading ? <Footer /> : null}
		</>
	)
}
