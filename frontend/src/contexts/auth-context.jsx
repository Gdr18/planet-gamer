import React, { useState, useContext, useEffect } from 'react'

import { getCurrentUser } from '../services/api/user-service'
import { logout } from '../services/api/auth-service'
import { useErrorContext } from './error-context'

const AuthContext = React.createContext([[]])

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})
	const [currentBasket, setCurrentBasket] = useState([])
	const [currentAddresses, setCurrentAddresses] = useState([])
	const [currentOrders, setCurrentOrders] = useState([])

	const { setError } = useErrorContext()

	useEffect(() => {
		const token = localStorage.getItem('access_token')
		if (!token) {
			setLoggedUser({})
		}
		if (token && !Object.keys(loggedUser).length) {
			const getUser = async () => {
				await getCurrentUser()
					.then(user => {
						const { basket, ...userData } = user
						setLoggedUser(userData)
						setCurrentBasket(basket)
					})
					.catch(error => setError(error))
			}
			getUser()
		}
	}, [loggedUser.id])


	const logoutUser = async () => {
		await logout()
			.then(() => {
				setLoggedUser({})
				setCurrentBasket([])
				setCurrentAddresses([])
				setCurrentOrders([])
			})
			.catch(error => setError(error))
	}

	return (
		<AuthContext.Provider
			value={{
				loggedUser,
				currentBasket,
				currentAddresses,
				currentOrders,
				setLoggedUser,
				logoutUser,
				setCurrentBasket,
				setCurrentAddresses,
				setCurrentOrders
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
