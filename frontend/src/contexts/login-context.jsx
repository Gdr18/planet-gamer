import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'

const LoginContext = React.createContext([[]])

export const useLoginContext = () => useContext(LoginContext)

export const LoginProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})

	useEffect(() => {
		if (!Object.keys(loggedUser).length) rescuingUser()
	}, [loggedUser])

	const rescuingUser = () => {
		const token = localStorage.getItem('refresh_token')
		if (!token) return
		axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`, {
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(response => {
				localStorage.setItem('access_token', response.data.access_token)
				setLoggedUser(response.data.user)
			})
			.catch(error => {
				console.log('Rescuing error', error)
			})
	}

	const handleLogout = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return
		axios
			.post(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, null, {
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(() => {
				setLoggedUser({})
				localStorage.removeItem('access_token')
				localStorage.removeItem('refresh_token')
			})
			.catch(error => {
				console.log('Error logging out', error)
			})
	}

	return (
		<LoginContext.Provider
			value={{
				loggedUser,
				setLoggedUser,
				handleLogout,
				rescuingUser
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
