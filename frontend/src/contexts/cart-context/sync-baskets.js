import { executeBasketAction } from '../../services/api/basket-service'

export const syncFromLocal = async (localBasket, customerId, callApi) => {
	const postedResults = await Promise.all(
		localBasket.map(item => {
			const payload = { ...item, userId: customerId }
			return callApi(() => executeBasketAction('post', payload))
		})
	)

	const posted = postedResults
		.filter(result => result && result.ok)
		.map(result => result.response)

	return [...posted]
}

export const syncMergeBaskets = async (
	serverBasket,
	localBasket,
	customerId,
	callApi
) => {
	let merged = []
	const updatedServerIds = []

	const updatedFromDb = await Promise.all(
		serverBasket.map(async serverItem => {
			const existLocalItem = localBasket.find(
				localItem => localItem.game.id === serverItem.game.id
			)
			if (existLocalItem) {
				updatedServerIds.push(existLocalItem.game.id)
				const { ok, response } = await callApi(() =>
					executeBasketAction('put', {
						...serverItem,
						qty: serverItem.qty + existLocalItem.qty
					})
				)

				return ok ? response : serverItem
			}
			return serverItem
		})
	)

	const itemsNotInServer = localBasket.filter(
		localItem => !updatedServerIds.includes(localItem.game.id)
	)
	const localItemsResults = await Promise.all(
		itemsNotInServer.map(item => {
			const payload = { ...item, userId: customerId }
			return callApi(() => executeBasketAction('post', payload))
		})
	)
	const localItemsPosted = localItemsResults
		.filter(result => result && result.ok)
		.map(result => result.response)

	merged = [...updatedFromDb, ...localItemsPosted]
	return merged
}
