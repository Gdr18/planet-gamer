import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const GamesContext = createContext([[]])

export const useGamesContext = () => useContext(GamesContext)

export const GamesProvider = ({ children }) => {
	const [games, setGames] = useState([])

	const getGames = platform => {
		axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/games/platforms/${platform}`, {
				withCredentials: true
			})
			.then(response => {
				setGames(response.data)
			})
			.catch(error => {
				console.log('An error ocurred', error)
			})
	}

	return (
		<GamesContext.Provider
			value={{
				games,
				getGames
			}}
		>
			{children}
		</GamesContext.Provider>
	)
}
