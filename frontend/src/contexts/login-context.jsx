import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'

import { refreshToken } from '../services/api-client'

const LoginContext = React.createContext([[]])

export const useLoginContext = () => useContext(LoginContext)

export const LoginProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})

	useEffect(() => {
		if (!Object.keys(loggedUser).length) getUser()
	}, [])

	const getUser = async () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(response => {
				setLoggedUser(response.data)
			})
			.catch(async error => {
				if (error.response?.data.err === 'expired_token') {
					await refreshUser()
					getUser()
				}
				console.log('Error getting user', error)
			})
	}

	// TODO: No funcional, llamada en api-client no puede setear user
	const refreshUser = () => {
		const token = localStorage.getItem('refresh_token')
		if (!token) return
		return refreshToken()
			.then(response => {
				localStorage.setItem('access_token', response.access_token)
				setLoggedUser(response.user)
			})
			.catch(error => {
				if (error.response?.data.err === 'expired_token') {
					setLoggedUser({})
				}
				console.log('Rescuing user error', error)
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
			.catch(async error => {
				console.log('Error logging out', error)
				if (error.response?.data.err === 'expired_token') {
					await refreshUser()
					handleLogout()
				}
			})
	}

	return (
		<LoginContext.Provider
			value={{
				loggedUser,
				setLoggedUser,
				handleLogout,
				getUser,
				refreshUser
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
