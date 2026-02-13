import React, { useState, useContext, useEffect } from 'react'

import { getCurrentUser } from '../services/api/user-service'
import { logout } from '../services/api/auth-service'
import { useErrorContext } from './error-context'

const LoginContext = React.createContext([[]])

export const useLoginContext = () => useContext(LoginContext)

export const LoginProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})

	const { setError } = useErrorContext()

	useEffect(() => {
		const token = localStorage.getItem('access_token')
		if (!token) {
			setLoggedUser({})
		} else if (token && !Object.keys(loggedUser).length) {
			getUser()
		}
	}, [])

	const getUser = async () => {
		await getCurrentUser().then(user => setLoggedUser(user)).catch(error => setError(error))
	}

	const logoutUser = async () => {
		await logout().then(() => setLoggedUser({})).catch(error => setError(error))
	}

	return (
		<LoginContext.Provider
			value={{
				loggedUser,
				setLoggedUser,
				logoutUser,
				getUser
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
