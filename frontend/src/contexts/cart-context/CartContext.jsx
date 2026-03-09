import React, { useState, useContext, useEffect } from 'react'

import { useAuthContext } from '../AuthContext'

import { useApiWithErrors } from '../../hooks/useApiWithErrors'

import { executeBasketAction } from '../../services/api/basket-service'
import { syncFromLocal, syncMergeBaskets } from './sync-baskets'

const CartContext = React.createContext([[]])

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
	const [basket, setBasket] = useState([])
	const [total, setTotal] = useState(0)
	const [countProducts, setCountProducts] = useState(0)
	const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false)

	const { loggedUser, currentBasket, setCurrentBasket } = useAuthContext()
	const { callApi } = useApiWithErrors()

	useEffect(() => {
		if (Object.keys(loggedUser).length) {
			syncBaskets()
		} else {
			cleaningBasket()
		}
	}, [loggedUser.id])

	const syncBaskets = async () => {
		let basketUpdated = []
		if (currentBasket.length && !basket.length) {
			basketUpdated = [...currentBasket]
		} else if (!currentBasket.length && basket.length) {
			basketUpdated = await syncFromLocal(basket, loggedUser.id, callApi)
		} else if (currentBasket.length && basket.length) {
			basketUpdated = await syncMergeBaskets(
				currentBasket,
				basket,
				loggedUser.id,
				callApi
			)
		}

		setBasket([...basketUpdated])
		setCountProducts(basketUpdated.reduce((acc, item) => acc + item.qty, 0))
		setTotal(
			basketUpdated.reduce((acc, item) => acc + item.game.priceInCents * item.qty, 0)
		)
		setCurrentBasket([])
	}

	const deleteItemBasket = async itemBasket => {
		const result = basket.filter(item => item.id !== itemBasket.id)
		setTotal(
			total - itemBasket.game.priceInCents * itemBasket.qty
		)
		setCountProducts(countProducts - itemBasket.qty)
		setBasket(result)
		if (itemBasket.userId) {
			await callApi(() => executeBasketAction('delete', itemBasket))
		}
	}

	const addItemBasket = async newItem => {
		const existItemInBasket = basket.find(item => item.game.id === newItem.id)
		if (existItemInBasket) {
			updateItemBasket(existItemInBasket, 'add')
			return
		}

		let itemBasket = {
			id: newItem.id,
			userId: loggedUser.id || null,
			gameId: newItem.id,
			game: { ...newItem },
			qty: 1
		}
		setTotal(total + itemBasket.game.priceInCents * 1)
		setCountProducts(countProducts + 1)

		if (itemBasket.userId) {
			const { ok, response } = await callApi(() =>
				executeBasketAction('post', itemBasket)
			)
			if (!ok) return

			itemBasket = { ...itemBasket, id: response.id }
		}

		setBasket([...basket, itemBasket])
	}

	const updateItemBasket = async (itemBasket, operator) => {
		if (operator === 'remove' && itemBasket.qty === 1) {
			deleteItemBasket(itemBasket)
			return
		}

		const games = basket.map(item => {
			if (item.game.id === itemBasket.game.id) {
				const newQty = operator === 'add' ? item.qty + 1 : item.qty - 1
				itemBasket = { ...item, qty: newQty }
				return itemBasket
			} else {
				return item
			}
		})

		setTotal(
			operator === 'add'
				? total + itemBasket.game.priceInCents * 1
				: total - itemBasket.game.price * 1
		)
		setCountProducts(operator === 'add' ? countProducts + 1 : countProducts - 1)
		setBasket([...games])

		if (itemBasket.userId) {
			await callApi(() => executeBasketAction('put', itemBasket))
		}
	}

	const cleaningBasket = () => {
		setTotal(0)
		setCountProducts(0)
		setBasket([])
	}

	return (
		<CartContext.Provider
			value={{
				basket,
				total,
				countProducts,
				isCheckoutInProgress,
				addItemBasket,
				updateItemBasket,
				deleteItemBasket,
				cleaningBasket,
				setIsCheckoutInProgress
			}}
		>
			{children}
		</CartContext.Provider>
	)
}
