import { executeBasketAction } from './api/basket-service'

export const syncFromLocal = async (localBasket, loggedUser) => {
	const posted = await Promise.all(
		localBasket.map(item => {
			const payload = { ...item, userId: loggedUser.id }
			return executeBasketAction(payload, 'post')
		})
	)
	return [...posted]
}

export const syncMergeBaskets = async (loggedUser, localBasket) => {
	const merged = []
	const usedLocalIds = new Set()

	const updatedFromDb = await Promise.all(
		loggedUser.basket.map(async item => {
			const localItem = localBasket.find(b => b.game.id === item.game.id)
			if (localItem) {
				usedLocalIds.add(localItem.game.id)
				return executeBasketAction(
					{ ...item, qty: item.qty + localItem.qty },
					'put'
				)
			}
			return item
		})
	)

	merged.push(...updatedFromDb)

	const localOnly = localBasket.filter(b => !usedLocalIds.has(b.game.id))
	const postedLocalOnly = await Promise.all(
		localOnly.map(item => {
			const payload = { ...item, userId: loggedUser.id }
			return executeBasketAction(payload, 'post')
		})
	)

	merged.push(...postedLocalOnly)
	return merged
}
