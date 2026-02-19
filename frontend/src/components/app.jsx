import { Routes, Route } from 'react-router-dom'

import Home from './pages/home'
import Contact from './pages/contact'
import Products from './pages/products/products'
import Game from './pages/game'
import Checkout from './pages/checkout/checkout'
import NoMatch from './pages/no-match'
import GamesManager from './pages/games-manager/games-manager'
import RolesManager from './pages/roles-manager'
import Profile from './pages/profile'

import { useAuthContext } from '../contexts/auth-context'

export default function App() {
	const { loggedUser } = useAuthContext()
	return (
		<div className='app'>
			<Routes>
				<Route exact path='/' element={<Home />} />
				<Route path='/platform/:platform' element={<Products />} />
				<Route path='/game/:game' element={<Game />} />
				<Route path='/contact' element={<Contact />} />
				{loggedUser.id && <Route path='/profile' element={<Profile />} />}
				{loggedUser.id && <Route path='/checkout' element={<Checkout />} />}
				{loggedUser.role < 3 && (
					<Route path='/games-manager' element={<GamesManager />} />
				)}
				{loggedUser.role === 1 && (
					<Route path='/roles-manager' element={<RolesManager />} />
				)}
				<Route path='*' element={<NoMatch />} />
			</Routes>
		</div>
	)
}
