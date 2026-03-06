import { createContext, useContext, useState } from 'react'

import { getGamesByPlatform } from '../services/api/game-service'

import { useApiWithErrors } from '../hooks/useApiWithErrors'

const GamesContext = createContext([[]])

export const useGamesContext = () => useContext(GamesContext)

export const GamesProvider = ({ children }) => {
	const [games, setGames] = useState([])

	const { callApi } = useApiWithErrors()

	const getGames = async platform => {
		const { ok, response: fetchedGames } = await callApi(() =>
			getGamesByPlatform(platform)
		)
		if (ok) {
			fetchedGames.forEach(game => {
				game.price = Math.round(Number(game.price) * 100)
			})
			setGames([...games, ...fetchedGames])
			return fetchedGames
		}
	}

	return (
		<GamesContext.Provider
			value={{
				games,
				getGames,
				setGames
			}}
		>
			{children}
		</GamesContext.Provider>
	)
}
