import React, { useState, useContext, useEffect } from 'react'

import { getCurrentUser } from '../services/api/user-service'
import { refreshToken, logout } from '../services/api/auth-service'

const LoginContext = React.createContext([[]])

export const useLoginContext = () => useContext(LoginContext)

export const LoginProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})

	useEffect(() => {
		const token = localStorage.getItem('access_token')
		if (!token) {
			setLoggedUser({})
		} else if (token && !Object.keys(loggedUser).length) {
			getUser()
		}
	}, [])

	const getUser = async () => {
		const result = await getCurrentUser().then(user => setLoggedUser(user))
	}

	const refreshUser = async () => {
		const result = await refreshToken()
			.then(user => {
				setLoggedUser(user)
			})
			.catch(() => setLoggedUser({}))
	}

	const logoutUser = async () => {
		const result = await logout().then(() => {
			setLoggedUser({})
		})
	}

	return (
		<LoginContext.Provider
			value={{
				loggedUser,
				setLoggedUser,
				logoutUser,
				getUser,
				refreshUser
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
