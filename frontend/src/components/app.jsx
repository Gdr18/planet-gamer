import { Routes, Route } from 'react-router-dom'

import Home from './pages/home'
import Contact from './pages/contact'
import Products from './pages/products'
import Game from './pages/game'
import Checkout from './pages/checkout'
import NoMatch from './pages/no-match'
import GameManager from './pages/game-manager'
import Profile from './pages/profile'

import { useLoginContext } from '../contexts/login-context'

export default function App() {
	const { loggedUser } = useLoginContext()
	return (
		<div className='app'>
			<Routes>
				<Route exact path='/' element={<Home />} />
				<Route path='/p/:platform' element={<Products />} />
				<Route path='/g/:game' element={<Game />} />
				<Route path='/contact' element={<Contact />} />
				{loggedUser ? (
					<Route path={`/profile/${loggedUser.id}`} element={<Profile />} />
				) : null}
				{loggedUser ? (
					<Route path={`/checkout/${loggedUser.id}`} element={<Checkout />} />
				) : null}
				{loggedUser.admin ? (
					<Route
						path={`/game-manager/${loggedUser.id}`}
						element={<GameManager />}
					/>
				) : null}
				<Route element={<NoMatch />} />
			</Routes>
		</div>
	)
}
