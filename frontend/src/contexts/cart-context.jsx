import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'

import { useLoginContext } from './login-context'

const CartContext = React.createContext([[]])

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
	const [basket, setBasket] = useState([])
	const [total, setTotal] = useState(0)
	const [countProducts, setCountProducts] = useState(0)
	const [checkingCheckout, setCheckingCheckout] = useState(false)

	const { loggedUser, refreshToken } = useLoginContext()

	useEffect(() => {
		if (Object.keys(loggedUser).length) {
			syncBaskets()
		} else {
			cleaningBasket()
		}
	}, [loggedUser.id])

	const syncBaskets = async () => {
		let basketUpdated = []
		if (loggedUser.basket.length && !basket.length) {
			basketUpdated = [...loggedUser.basket]
			
		} else if (!loggedUser.basket.length && basket.length) {
			const posted = await Promise.all(
				basket.map(item => {
					const payload = { ...item, userId: loggedUser.id }
					return executeBasketAction(payload, 'post')
				})
			)
			basketUpdated = [...posted]

		} else if (loggedUser.basket.length && basket.length) {
			const merged = []
			const usedLocalIds = new Set()

			const updatedFromDb = await Promise.all(
				loggedUser.basket.map(async item => {
					const localItem = basket.find(b => b.game.id === item.game.id)
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

			const localOnly = basket.filter(b => !usedLocalIds.has(b.game.id))
			const postedLocalOnly = await Promise.all(
				localOnly.map(item => {
					const payload = { ...item, userId: loggedUser.id }
					return executeBasketAction(payload, 'post')
				})
			)

			merged.push(...postedLocalOnly)
			basketUpdated = merged
		}

		setBasket([...basketUpdated])
		setCountProducts(basketUpdated.reduce((acc, item) => acc + item.qty, 0))
		setTotal(
			basketUpdated.reduce((acc, item) => acc + item.game.price * item.qty, 0)
		)
	}

	const executeBasketAction = async (basketItemData, methodHTTP) => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axios({
			method: methodHTTP,
			url: `${import.meta.env.VITE_BACKEND_URL}/basket-items/${methodHTTP !== 'post' ? basketItemData.id : ''}`,
			data: methodHTTP !== 'delete' ? basketItemData : null,
			withCredentials: true,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then(response => {
				console.log(response.data, 'Request Basket Items Successfully')
				return response.data
			})
			.catch(async error => {
				if (error.response?.data?.err === 'expired_token') {
					await refreshToken()
					executeBasketAction(basketItemData, methodHTTP)
				}
				console.log(error, 'error en la solicitud a basket')
			})
	}

	const deleteItemBasket = async itemBasket => {
		const result = basket.filter(item => item.id !== itemBasket.id)
		setTotal(
			total - Math.round(itemBasket.game.price * itemBasket.qty * 100) / 100
		)
		setCountProducts(countProducts - itemBasket.qty)
		setBasket(result)
		itemBasket.userId && (await executeBasketAction(itemBasket, 'delete'))
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
			itemBasket = await executeBasketAction(itemBasket, 'post')
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
