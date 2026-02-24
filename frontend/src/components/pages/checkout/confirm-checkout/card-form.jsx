import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

export default function CardForm({ handleSubmitPayment, previousStep, nextStep }) {
	const stripe = useStripe()
	const elements = useElements()

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

		setDisabledButton(true)

		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: 'card',
			card: elements.getElement(CardElement)
		})

		if (error) {
			setErrorText(error.message)
			setDisabledButton(false)
		} else {
			const response = await handleSubmitPayment(paymentMethod.id)
			if (response.status === 'requires_action') {
				const { error: errorConfirm } = await stripe.confirmCardPayment(
					response.client_secret
				)
				if (errorConfirm) {
					setErrorText(errorConfirm.message)
					setDisabledButton(false)
					return
				}
				nextStep()
			}
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
						event.preventDefault()
						previousStep()
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
