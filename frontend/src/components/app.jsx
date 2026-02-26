import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Contact from './pages/Contact'
import Products from './pages/products/Products'
import Game from './pages/Game'
import Checkout from './pages/checkout/Checkout'
import NoMatch from './pages/NoMatch'
import GamesManager from './pages/games-manager/GamesManager'
import RolesManager from './pages/RolesManager'
import Profile from './pages/Profile'

import { useAuthContext } from '../contexts/AuthContext'

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
