import React, { useState, useContext } from 'react'
import axios from 'axios'
import { useLoginContext } from './login-context'
import { use } from 'react'

const CartContext = React.createContext([[]])

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
	const [basketItems, setBasketItems] = useState([])
	const [total, setTotal] = useState(0)
	const [countProducts, setCountProducts] = useState(0)
	const [checkingCheckout, setCheckingCheckout] = useState(false)

<<<<<<< HEAD
	const { loggedUser } = useLoginContext()

	useEffect(() => {
		if (loggedUser && !basketItems) {
			rescuingBasket(loggedUser.id)
		}
	}, [loggedUser])

=======
>>>>>>> ce1ad6bcd3b6c2df17be7b8dfb6fcf122ec2d0bf
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

	const requestBaskets = (dataForm, methodHTTP) => {
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

	const rescuingBasket = idLoggedUser => {
		const data = basketItems.map(basketItem => {
			return {
				basket_user_id: idLoggedUser,
				basket_game_id: basketItem.id,
				qty: basketItem.qty
			}
		})
		axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/basket-games/${idLoggedUser}`, {
				withCredentials: true
			})
			.then(response => {
				if (response.data.length && !basketItems.length) {
					setBasketItems(response.data)
					setCountProducts(response.data.reduce((a, b) => a.qty + b.qty))
					setTotal(
						response.data.reduce((a, b) => a.price * a.qty + b.price * b.qty)
					)
				} else if (!response.data.length && basketItems.length) {
					requestBaskets(data, 'post')
				} else if (response.data.length && basketItems.length) {
					// TODO: Mezclar ambas listas de juegos.
					requestBaskets({ basket_user_id: idLoggedUser }, 'delete')
					requestBaskets(data, 'post')
				}
			})
	}

	return (
		<CartContext.Provider
			value={{
				rescuingBasket,
				requestBaskets,
				basketItems,
				total,
				countProducts,
				handleGamesBasket,
				cleaningBasket,
				checkingCheckout,
<<<<<<< HEAD
				setCheckingCheckout,
=======
				setCheckingCheckout
>>>>>>> ce1ad6bcd3b6c2df17be7b8dfb6fcf122ec2d0bf
			}}
		>
			{children}
		</CartContext.Provider>
	)
}
