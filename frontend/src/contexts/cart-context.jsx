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
		if (!Object.keys(loggedUser).length && basket.length)
			return cleaningBasket()
	}, [loggedUser])

	
		const syncBaskets = async () => {
			loggedUser?.basket.forEach(item => {
				item.game.price = parseFloat(item.game.price)
			})
			if (loggedUser?.basket.length && !basket.length) {
				setBasket([...loggedUser.basket])
				setCountProducts(
					loggedUser.basket.reduce((acc, item) => acc + item.qty, 0)
				)
				setTotal(
					loggedUser.basket.reduce(
						(acc, item) => acc + item.game.price * item.qty,
						0
					)
				)
			} else if (!loggedUser?.basket?.length && basket.length) {
				const data = basket.map(basketItem => ({
					userId: loggedUser.id,
					gameId: basketItem.game.id,
					qty: basketItem.qty
				}))
				const newBasket = []
				for (const item of data) {
					const itemPosted = await executeBasketAction(item, 'post')
					newBasket.push(itemPosted)
				}
				setBasket(newBasket)
			} else if (loggedUser?.basket?.length && basket.length) {
				const mergedBasket = []

				for (const itemBasket of basket) {
					const existingItem = loggedUser.basket.find(
						item => item.game.id === itemBasket.game.id
					)

					if (existingItem) {
						const data = {
							id: existingItem.id,
							gameId: existingItem.game.id,
							userId: loggedUser.id,
							qty: existingItem.qty + itemBasket.qty
						}
						const updatedItem = await executeBasketAction(data, 'put')
						mergedBasket.push(updatedItem)
					} else {
						const data = {
							userId: loggedUser.id,
							gameId: itemBasket.game.id,
							qty: itemBasket.qty
						}
						const newItem = await executeBasketAction(data, 'post')
						mergedBasket.push(newItem)
					}
				}

				for (const itemDb of loggedUser.basket) {
					if (!mergedBasket.find(item => item.id === itemDb.id)) {
						mergedBasket.push(itemDb)
					}
				}

				setBasket([...mergedBasket])
				setCountProducts(mergedBasket.reduce((acc, item) => acc + item.qty, 0))
				setTotal(
					mergedBasket.reduce(
						(acc, item) => acc + item.game.price * item.qty,
						0
					)
				)
			}
		}
		if (
			loggedUser?.basket &&
			JSON.stringify(basket) !== JSON.stringify(loggedUser.basket)
		) {
			syncBaskets()
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

	const deleteItemBasket = itemBasket => {
		const result = basket.filter(item => item.id !== itemBasket.id)
		setTotal(
			total - Math.round(itemBasket.game.price * itemBasket.qty * 100) / 100
		)
		setCountProducts(countProducts - itemBasket.qty)
		setBasket(result)
		Object.keys(loggedUser).length && executeBasketAction(itemBasket, 'delete')
	}

	const addItemBasket = async newItem => {
		let itemBasket = {
			game: { ...newItem },
			id: newItem.id,
			qty: 1
		}
		setTotal(total + itemBasket.game.price * 1)
		setCountProducts(countProducts + 1)

		if (Object.keys(loggedUser).length) {
			const payload = {
				userId: loggedUser.id,
				gameId: newItem.id,
				qty: 1
			}
			itemBasket = await executeBasketAction(payload, 'post')
		}
		setBasket([...basket, itemBasket])
	}

	const updateItemBasket = (itemBasket, operator) => {
		let basketGameQty = 0
		const games = basket.map(item => {
			if (item.game.id === itemBasket.id) {
				basketGameQty = operator === 'remove' ? item.qty - 1 : item.qty + 1
				itemBasket = { ...item, qty: basketGameQty }
				return itemBasket
			} else {
				return item
			}
		})
		setTotal(
			operator === 'remove'
				? total - itemBasket.game.price * 1
				: total + itemBasket.game.price * 1
		)
		setCountProducts(
			operator === 'remove' ? countProducts - 1 : countProducts + 1
		)
		setBasket([...games])
		const data = {
			id: itemBasket.id,
			gameId: itemBasket.game.id,
			userId: loggedUser.id,
			qty: basketGameQty
		}
		Object.keys(loggedUser).length && executeBasketAction(data, 'put')
	}

	const handleGamesBasket = (itemBasket, operator = 'add') => {
		if (
			operator === 'delete' ||
			(operator === 'remove' && itemBasket.qty === 1)
		) {
			deleteItemBasket(itemBasket)
		} else if (
			(operator === 'add' &&
				basket.find(item => item.game.id === itemBasket.id)) ||
			operator === 'remove'
		) {
			updateItemBasket(itemBasket, operator)
		} else {
			addItemBasket(itemBasket)
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
				executeBasketAction,
				handleGamesBasket,
				cleaningBasket,
				setCheckingCheckout
			}}
		>
			{children}
		</CartContext.Provider>
	)
}
