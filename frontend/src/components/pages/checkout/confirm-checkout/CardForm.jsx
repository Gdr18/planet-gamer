import { useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'

export default function CardForm({
	handleSubmitPayment,
	previousStep,
	setLoading
}) {
	const elements = useElements()
	const stripe = useStripe()

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

		setLoading(true)
		setDisabledButton(true)

		if (!elements) {
			setErrorText(
				'No se ha podido inicializar el formulario de pago. Inténtalo de nuevo en unos segundos.'
			)
			setLoading(false)
			setDisabledButton(false)
			return
		}

		const cardElement = elements.getElement(CardElement)

		const { ok, message } = await handleSubmitPayment(cardElement, stripe)

		if (!ok) {
			setErrorText(message)
			setDisabledButton(false)
		}

		setLoading(false)
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
