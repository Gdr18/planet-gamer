import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

import { executeOrderAction } from '../../services/api/order-service'
import { deleteBasketsUser } from '../../services/api/basket-service'

import { useCartContext } from '../../contexts/cart-context'

export default function CardForm({ setSteps, loggedUser, setOrder }) {
	const stripe = useStripe()
	const elements = useElements()

	const { cleaningBasket, setCheckingCheckout, countProducts, total } =
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
			const data = await executeOrderAction(
				{
					total,
					qty: countProducts,
					userId: loggedUser.id
				},
				'post'
			)
			
			setCheckingCheckout(true)
			cleaningBasket()
			deleteBasketsUser(loggedUser.id)
			setSteps(3)
			setOrder(data)
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
