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

	const { loggedUser, rescuingUser } = useLoginContext()

	useEffect(() => {
		if (!Object.keys(loggedUser).length && basket.length)
			return cleaningBasket()
	}, [loggedUser])

	useEffect(() => {
		const syncBaskets = async () => {
			if (JSON.stringify(basket) === JSON.stringify(loggedUser.basket)) {
				console.log('Baskets are the same')
			} else if (loggedUser?.basket?.length && !basket.length) {
				setBasket(loggedUser.basket)
				setCountProducts(loggedUser.basket.reduce((a, b) => a.qty + b.qty))
				setTotal(
					loggedUser.basket.reduce((a, b) => a.game.price * a.qty + b.game.price * b.qty)
				)
			} else if (!loggedUser?.basket?.length && basket.length) {
				const data = basket.map(basketItem => ({
					userId: loggedUser.id,
					gameId: basketItem.game.id,
					qty: basketItem.qty
				}))
				setBasket([])
				for (const item of data) {
					const itemPosted = await executeBasketAction(item, 'post')
					setBasket([...basket, itemPosted])
				}
			} else if (loggedUser?.basket?.length && basket.length) {
				// TODO: Comprobar si esto funciona
				let mergedBaskets = [...basket, ...loggedUser.basket]
				mergedBaskets = mergedBaskets.reduce((acc, current) => {
					const itemInCart = acc.find(item => item.id === current.id)
					if (!itemInCart) {
						return acc.concat([current])
					} else {
						return acc.map(item =>
							item.id === itemInCart.id
								? { ...item, qty: item.qty + current.qty }
								: item
						)
					}
				}, [])
				setBasket(mergedBaskets)
				setCountProducts(mergedBaskets.reduce((a, b) => a.qty + b.qty))
				setTotal(
					mergedBaskets.reduce((a, b) => a.game.price * a.qty + b.game.price * b.qty)
				)
			}
		}

		loggedUser?.basket && syncBaskets()
	}, [loggedUser?.basket])

	const executeBasketAction = async (basketItemData, methodHTTP) => {
		const token = localStorage.getItem('access_token')
		if (!token) return

		return axios({
			method: methodHTTP,
			url: `${import.meta.env.VITE_BACKEND_URL}/basket-items/${methodHTTP === 'delete' ? basketItemData.id : ''}`,
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
				if (error.response?.data === 'expired_token') {
					await rescuingUser()
					executeBasketAction(basketItemData, methodHTTP)
				}
				console.log(error, 'error en la solicitud a basket')
			})
	}

	const deleteItemBasket = itemBasket => {
		const result = basket.filter(item => item.id !== itemBasket.id)
		setTotal(
			total - Math.round((itemBasket.game.price) * itemBasket.qty * 100) / 100
		)
		setCountProducts(countProducts - itemBasket.qty)
		setBasket(result)
		Object.keys(loggedUser).length && executeBasketAction(itemBasket, 'delete')
	}

	const addItemBasket = async newItem => {
		let itemBasket = {
			game: {...newItem},
			id: newItem.id,
			qty: 1
		}
		setTotal(total + (itemBasket.game.price) * 1)
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
			if (item.id === itemBasket.id) {
				basketGameQty = operator === 'remove' ? item.qty - 1 : item.qty + 1
				return { ...item, qty: basketGameQty }
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
		Object.keys(loggedUser).length &&
			executeBasketAction({ ...itemBasket, qty: basketGameQty }, 'put')
	}

	const handleGamesBasket = (itemBasket, operator = 'add') => {
		if (
			operator === 'delete' ||
			(operator === 'remove' && itemBasket.qty === 1)
		) {
			deleteItemBasket(itemBasket)
		} else if (
			(operator === 'add' && itemBasket.qty > 0) ||
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
				handlingBasket: executeBasketAction,
				basket,
				total,
				countProducts,
				handleGamesBasket,
				cleaningBasket,
				checkingCheckout,
				setCheckingCheckout
			}}
		>
			{children}
		</CartContext.Provider>
	)
}
