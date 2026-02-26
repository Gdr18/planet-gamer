import './style/main.scss'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { ErrorModal } from './components/ErrorModal'
import App from './components/App'

import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/cart-context/CartContext'
import { GamesProvider } from './contexts/GamesContext'
import { ErrorProvider } from './contexts/ErrorContext'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<ErrorProvider>
				<AuthProvider>
					<GamesProvider>
						<CartProvider>
							<ErrorModal />
							<App />
						</CartProvider>
					</GamesProvider>
				</AuthProvider>
			</ErrorProvider>
		</BrowserRouter>
	</React.StrictMode>
)
