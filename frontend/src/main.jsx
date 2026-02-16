import './style/main.scss'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { ErrorModal } from './components/error-modal.jsx'
import App from './components/app.jsx'

import { LoginProvider } from './contexts/auth-context'
import { CartProvider } from './contexts/cart/cart-context'
import { GamesProvider } from './contexts/games-context'
import { ErrorProvider } from './contexts/error-context'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<ErrorProvider>
				<LoginProvider>
					<GamesProvider>
						<CartProvider>
							<ErrorModal />
							<App />
						</CartProvider>
					</GamesProvider>
				</LoginProvider>
			</ErrorProvider>
		</BrowserRouter>
	</React.StrictMode>
)
