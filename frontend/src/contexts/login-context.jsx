import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const LoginContext = React.createContext([[]])

export const useLoginContext = () => useContext(LoginContext)

export const LoginProvider = ({ children }) => {
	const [loggedUser, setLoggedUser] = useState({})
	const [logout, setLogout] = useState(false)

	useEffect(() => {
		if (!Object.keys(loggedUser).length && !logout) getUser()
	}, [loggedUser])

	const getUser = async () => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		const decoded = jwtDecode(token)
		const userId = decoded.sub

		return axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(response => {
				setLoggedUser(response.data)
				setLogout(false)
			})
			.catch(async error => {
				if (error.response?.data.err === 'expired_token') {
					await refreshToken()
					getUser()
				}
				console.log('Error getting user', error)
			})
	}

	const refreshToken = () => {
		const token = localStorage.getItem('refresh_token')
		if (!token) return
		return axios
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
				if (error.response?.data.err === 'expired_token') {
					setLoggedUser({})
					localStorage.removeItem('access_token')
					localStorage.removeItem('refresh_token')
				}
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
				setLogout(true)
			})
			.catch(error => {
				console.log('Error logging out', error)
				if (error.response?.data.err === 'expired_token') {
					getUser().then(() => handleLogout())
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
				refreshToken
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
