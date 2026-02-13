import { Routes, Route } from 'react-router-dom'

import Home from './pages/home'
import Contact from './pages/contact'
import Products from './pages/products'
import Game from './pages/game'
import Checkout from './pages/checkout'
import NoMatch from './pages/no-match'
import GameManager from './pages/game-manager'
import Profile from './pages/profile'

import { useLoginContext } from '../contexts/auth-context'

export default function App() {
	const { loggedUser } = useLoginContext()
	return (
		<div className='app'>
			<Routes>
				<Route exact path='/' element={<Home />} />
				<Route path='/platform/:platform' element={<Products />} />
				<Route path='/game/:game' element={<Game />} />
				<Route path='/contact' element={<Contact />} />
				{Object.keys(loggedUser).length ? (
					<Route path={`/profile`} element={<Profile />} />
				) : null}
				{Object.keys(loggedUser).length ? (
					<Route path={`/checkout`} element={<Checkout />} />
				) : null}
				{Object.keys(loggedUser).length && loggedUser.role < 3 ? (
					<Route
						path={`/game-manager`}
						element={<GameManager />}
					/>
				) : null}
				<Route element={<NoMatch />} />
			</Routes>
		</div>
	)
}
