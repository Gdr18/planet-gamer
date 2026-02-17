import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/home'
import Contact from './pages/contact'
import Products from './pages/products/products'
import Game from './pages/game'
import Checkout from './pages/checkout/checkout'
import NoMatch from './pages/no-match'
import GameManager from './pages/games-manager/games-manager'
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
				<Route
					path='/profile'
					element={
						Object.keys(loggedUser).length ? (
							<Profile />
						) : (
							<Navigate to='/' replace />
						)
					}
				/>
				<Route
					path='/checkout'
					element={
						Object.keys(loggedUser).length ? (
							<Checkout />
						) : (
							<Navigate to='/' replace />
						)
					}
				/>
				<Route
					path='/game-manager'
					element={
						Object.keys(loggedUser).length && loggedUser.role < 3 ? (
							<GameManager />
						) : (
							<Navigate to='/' replace />
						)
					}
				/>
				<Route path='*' element={<NoMatch />} />
			</Routes>
		</div>
	)
}
