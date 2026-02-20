import { createContext, useContext, useState } from 'react'

import { getGamesByPlatform } from '../services/api/game-service'
import { useErrorContext } from './error-context'

const GamesContext = createContext([[]])

export const useGamesContext = () => useContext(GamesContext)

export const GamesProvider = ({ children }) => {
	const [games, setGames] = useState([])

	const { setError } = useErrorContext()

	const getGames = async platform => {
		return await getGamesByPlatform(platform)
			.then(fetchedGames => {
				setGames([...games, ...fetchedGames])
				return fetchedGames
			})
			.catch(error => {
				setError(error)
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
