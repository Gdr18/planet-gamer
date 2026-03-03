import React, { useState, useContext, useEffect } from 'react'

import { getCurrentUser } from '../services/api/user-service'
import { logout } from '../services/api/auth-service'

import { useApiWithErrors } from '../hooks/useApiWithErrors'

const AuthContext = React.createContext([[]])

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})
	const [currentBasket, setCurrentBasket] = useState([])
	const [currentAddresses, setCurrentAddresses] = useState([])
	const [currentOrders, setCurrentOrders] = useState([])

	const { callApi } = useApiWithErrors()

	useEffect(() => {
		if (!Object.keys(loggedUser).length) {
			callApi(() => getCurrentUser()).then(({ ok, response: user }) => {
				if (ok) {
					const { basket, ...userData } = user
					setLoggedUser(userData)
					setCurrentBasket(basket)
				}
			})
		}
	}, [loggedUser.id])

	const logoutUser = async () => {
		const { ok, } = await callApi(() => logout())
		if (ok) {
			setLoggedUser({})
			setCurrentBasket([])
			setCurrentAddresses([])
			setCurrentOrders([])
		}
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
