import { useState } from 'react'
import axios from 'axios'

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

import { useCartContext } from '../../contexts/cart-context'

export default function CardForm({ setSteps, loggedUser, setOrder }) {
	const stripe = useStripe()
	const elements = useElements()

	const { cleaningBasket, setCheckingCheckout, countProducts, total, requestBaskets } =
		useCartContext()

	const [errorText, setErrorText] = useState('')
	const [disabledButton, setDisabledButton] = useState(false)

	const CARD_ELEMENT_OPTIONS = {
		iconStyle: 'solid',
		hidePostalCode: true,
		style: {
			base: {
				iconColor: '#995099',
				color: '#cbcbcb',
				fontSize: '18px',
				'::placeholder': {
					color: '#777777'
				}
			},
			invalid: {
				color: '#e5424d',
				':focus': {
					color: '#e5424d'
				}
			}
		}
	}

	const handleSubmitCard = async event => {
		event.preventDefault()

		setOrder({
			total,
			qty: countProducts
		})

		setDisabledButton(true)
		// Arreglar Stripes
		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: 'card',
			card: elements.getElement(CardElement)
		})

		if (error) {
			setErrorText(error.message)
			setDisabledButton(false)
		} else {
			axios
				.post(
					`${import.meta.env.VITE_BACKEND_URL}/order`,
					{
						total,
						qty: countProducts,
						order_user_id: loggedUser.id
					},
					{ withCredentials: true }
				)
				.then(response => {
					setCheckingCheckout(true)
					cleaningBasket()
					requestBaskets({ basket_user_id: loggedUser.id }, 'delete')
					setSteps(3)
					setOrder(response.data)
				})
				.catch(error => {
					console.log(error, 'error en el posteo de la orden')
				})
		}
	}

	return (
		<form className='card-wrapper' onSubmit={handleSubmitCard}>
			<CardElement options={CARD_ELEMENT_OPTIONS} />
			{errorText !== '' ? (
				<div className='error-text'>{`Error: ${errorText}`}</div>
			) : null}
			<div className='buttons-wrapper'>
				<button
					onClick={event => {
						setSteps(1)
						event.preventDefault()
					}}
				>
					Atrás
				</button>
				<button disabled={disabledButton} type='submit'>
					Pagar
				</button>
			</div>
		</form>
	)
}
