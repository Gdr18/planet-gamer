import React, { useState, useContext, useEffect } from 'react'

import { useAuthContext } from '../auth-context'
import { executeBasketAction } from '../../services/api/basket-service'
import { syncFromLocal, syncMergeBaskets } from './sync-baskets'

const CartContext = React.createContext([[]])

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
	const [basket, setBasket] = useState([])
	const [total, setTotal] = useState(0)
	const [countProducts, setCountProducts] = useState(0)
	const [checkingCheckout, setCheckingCheckout] = useState(false)

	const { loggedUser, currentBasket, setCurrentBasket} = useAuthContext()

	useEffect(() => {
		if (currentBasket.length) {
			syncBaskets()
		} else {
			cleaningBasket()
		}
	}, [currentBasket])

	const syncBaskets = async () => {
		let basketUpdated = []
		if (loggedUser.basket.length && !basket.length) {
			basketUpdated = [...loggedUser.basket]
		} else if (!loggedUser.basket.length && basket.length) {
			basketUpdated = await syncFromLocal(basket, loggedUser)
		} else if (loggedUser.basket.length && basket.length) {
			basketUpdated = await syncMergeBaskets(loggedUser, basket)
		}

		setBasket([...basketUpdated])
		setCountProducts(basketUpdated.reduce((acc, item) => acc + item.qty, 0))
		setTotal(
			basketUpdated.reduce((acc, item) => acc + item.game.price * item.qty, 0)
		)
	}

	const deleteItemBasket = async itemBasket => {
		const result = basket.filter(item => item.id !== itemBasket.id)
		setTotal(
			total - Math.round(itemBasket.game.price * itemBasket.qty * 100) / 100
		)
		setCountProducts(countProducts - itemBasket.qty)
		setBasket(result)
		if (itemBasket.userId) {
			await executeBasketAction(itemBasket, 'delete')
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
		setTotal(total + itemBasket.game.price * 1)
		setCountProducts(countProducts + 1)

		if (itemBasket.userId) {
			await executeBasketAction(itemBasket, 'post').then(
				item => {
					itemBasket = { ...itemBasket, id: item.id }
				}
			)
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
				? total + itemBasket.game.price * 1
				: total - itemBasket.game.price * 1
		)
		setCountProducts(operator === 'add' ? countProducts + 1 : countProducts - 1)
		setBasket([...games])

		if (itemBasket.userId) {
			await executeBasketAction(itemBasket, 'put')
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
				checkingCheckout,
				addItemBasket,
				updateItemBasket,
				deleteItemBasket,
				cleaningBasket,
				setCheckingCheckout
			}}
		>
			{children}
		</CartContext.Provider>
	)
}
