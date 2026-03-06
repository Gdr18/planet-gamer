import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import Contact from './pages/Contact'
import Products from './pages/products/Products'
import Game from './pages/Game'
import Checkout from './pages/checkout/Checkout'
import NoMatch from './pages/NoMatch'
import GamesManager from './pages/games-manager/GamesManager'
import RolesManager from './pages/RolesManager'
import Profile from './pages/Profile'

import { useCartContext } from '../contexts/cart-context/CartContext'

import { useAuthContext } from '../contexts/AuthContext'

export default function App() {
	const { loggedUser } = useAuthContext()
	const { basket, isCheckoutInProgress } = useCartContext()
	return (
		<div className='app'>
			<Routes>
				<Route exact path='/' element={<Home />} />
				<Route path='/platform/:platform' element={<Products />} />
				<Route path='/game/:game' element={<Game />} />
				<Route path='/contact' element={<Contact />} />
				<Route
					path='/profile'
					element={loggedUser.id ? <Profile /> : <Navigate to='/' replace />}
				/>
				<Route
					path='/checkout'
					element={
						loggedUser?.id && (basket.length || isCheckoutInProgress) ? (
							<Checkout />
						) : (
							<Navigate to='/' replace />
						)
					}
				/>
				{
					<Route
						path='/games-manager'
						element={
							loggedUser?.role < 3 ? (
								<GamesManager />
							) : (
								<Navigate to='/' replace />
							)
						}
					/>
				}
				{
					<Route
						path='/roles-manager'
						element={
							loggedUser?.role === 1 ? (
								<RolesManager />
							) : (
								<Navigate to='/' replace />
							)
						}
					/>
				}
				<Route path='*' element={<NoMatch />} />
			</Routes>
		</div>
	)
}
