import { executeBasketAction } from '../../services/api/basket-service'

export const syncFromLocal = async (localBasket, customerId) => {
	const posted = await Promise.all(
		localBasket.map(item => {
			const payload = { ...item, userId: customerId }
			return executeBasketAction(payload, 'post')
		})
	)
	return [...posted]
}

export const syncMergeBaskets = async (serverBasket, localBasket, customerId) => {
	let merged = []
	const updatedServerIds = []

	const updatedFromDb = await Promise.all(
		serverBasket.map(async serverItem => {
			const existLocalItem = localBasket.find(localItem => localItem.game.id === serverItem.game.id)
			if (existLocalItem) {
				updatedServerIds.push(existLocalItem.game.id)
				return executeBasketAction(
					{ ...serverItem, qty: serverItem.qty + existLocalItem.qty },
					'put'
				)
			}
			return serverItem
		})
	)

	const itemsNotInServer = localBasket.filter(localItem => !updatedServerIds.includes(localItem.game.id))
	const localItemsPosted = await Promise.all(
		itemsNotInServer.map(item => {
			const payload = { ...item, userId: customerId }
			return executeBasketAction(payload, 'post')
		})
	)

	merged = [...updatedFromDb, ...localItemsPosted]
	return merged
}
