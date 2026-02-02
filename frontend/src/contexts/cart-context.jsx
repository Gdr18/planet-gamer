import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useLoginContext } from './login-context'

const CartContext = React.createContext([[]])

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
	const [basketItems, setBasketItems] = useState([])
	const [total, setTotal] = useState(0)
	const [countProducts, setCountProducts] = useState(0)
	const [checkingCheckout, setCheckingCheckout] = useState(false)

	const { loggedUser } = useLoginContext()

	useEffect(() => {
		if (!loggedUser) {
			cleaningBasket()
		} else {
			mixingBasket()
		}
	}, [loggedUser])

	const requestBasket = (game, idLoggedUser, methodHTTP) => {
		axios({
			method: methodHTTP,
			url: `${import.meta.env.VITE_BACKEND_URL}/basket`,
			data: {
				qty: game.qty,
				basket_game_id: game.id,
				basket_user_id: idLoggedUser
			},
			withCredentials: true
		})
			.then(response => {
				console.log(response.data, 'Request Basket Successfully')
			})
			.catch(error => {
				console.log(error, 'error en la solicitud a basket')
			})
	}

	const addingBaskets = (dataForm, methodHTTP) => {
		axios({
			method: methodHTTP,
			url: `${import.meta.env.VITE_BACKEND_URL}/baskets`,
			data: dataForm,
			withCredentials: true
		})
			.then(response => {
				console.log(response.data, 'Request Baskets Successfully')
			})
			.catch(error => {
				console.log(error, 'error en la solicitud a basket')
			})
	}

	const handleGamesBasket = (game, idLoggedUser, operator = 'add') => {
		let basketGameQty = 0
		if (operator === 'remove' && game.qty > 1) {
			const games = basketItems.map(item => {
				if (item.id === game.id) {
					basketGameQty = item.qty - 1
					return { ...item, qty: item.qty - 1 }
				} else {
					return item
				}
			})
			setTotal(total - game.price)
			setCountProducts(countProducts - 1)
			setBasketItems([...games])
			idLoggedUser &&
				requestBasket({ ...game, qty: basketGameQty }, idLoggedUser, 'put')
		} else if (
			operator === 'delete' ||
			(operator === 'remove' && game.qty === 1)
		) {
			const result = basketItems.filter(item => item.id !== game.id)
			setTotal(total - Math.round(game.price * game.qty * 100) / 100)
			setCountProducts(countProducts - game.qty)
			setBasketItems(result)
			idLoggedUser && requestBasket(game, idLoggedUser, 'delete')
		} else if (operator === 'add') {
			if (basketItems.find(item => item.id === game.id)) {
				const games = basketItems.map(item => {
					if (item.id === game.id) {
						basketGameQty = item.qty + 1
						return { ...item, qty: item.qty + 1 }
					} else {
						return item
					}
				})
				setTotal(total + game.price * 1)
				setCountProducts(countProducts + 1)
				setBasketItems([...games])
				idLoggedUser &&
					requestBasket({ ...game, qty: basketGameQty }, idLoggedUser, 'put')
			} else {
				setTotal(total + game.price * 1)
				setCountProducts(countProducts + 1)
				setBasketItems([...basketItems, game])
				idLoggedUser && requestBasket(game, idLoggedUser, 'post')
			}
		}
	}

	const cleaningBasket = () => {
		setTotal(0)
		setCountProducts(0)
		setBasketItems([])
	}

	// !TODO: Desestructurar función dentro de useEffect
	const mixingBasket = () => {
		const data = basketItems.map(basketItem => ({
			basket_user_id: loggedUser.id,
			basket_game_id: basketItem.id,
			qty: basketItem.qty
		}))

		if (loggedUser.basket.length && !basketItems.length) {
			setBasketItems(loggedUser.basket)
			setCountProducts(loggedUser.basket.reduce((a, b) => a.qty + b.qty))
			setTotal(
				loggedUser.basket.reduce((a, b) => a.price * a.qty + b.price * b.qty)
			)
		} else if (!loggedUser.basket.length && basketItems.length) {
			addingBaskets(data, 'post')
		} else if (loggedUser.basket.length && basketItems.length) {
			// TODO: Comprobar si esto funciona
			let mergedBaskets = [...basketItems, ...loggedUser.basket]
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
			setBasketItems(mergedBaskets)
			setCountProducts(mergedBaskets.reduce((a, b) => a.qty + b.qty))
			setTotal(
				mergedBaskets.reduce((a, b) => a.price * a.qty + b.price * b.qty)
			)
		}
	}

	return (
		<CartContext.Provider
			value={{
				mixingBasket,
				addingBaskets,
				basketItems,
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
