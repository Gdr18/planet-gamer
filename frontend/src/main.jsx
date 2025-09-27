import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './components/app.jsx'
import './style/main.scss'

import { LoginProvider } from './contexts/login-context'
import { CartProvider } from './contexts/cart-context'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<LoginProvider>
				<CartProvider>
					<App />
				</CartProvider>
			</LoginProvider>
		</BrowserRouter>
	</React.StrictMode>
)
