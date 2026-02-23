import { useState } from 'react'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import CardForm from './card-form'

export default function ConfirmCheckout({
	basket,
	total,
    userData,
    previousStep,
    handleSubmitPayment
}) {

	const [stripePromise, setStripePromise] = useState(() =>
		loadStripe(import.meta.env.VITE_STRIPES)
	)

	return (
		<div className='payment-container'>
			<div className='payment-wrapper'>
				<div className='order-details-wrapper'>
					<div className='title-checkout'>Detalles Pedido</div>
					{basket.map(game => {
						return (
							<div key={game.id} className='item'>
								<img src={game.imgUrl} />
								<div className='title-price-wrapper'>
									<div>{game.title}</div>
									<p>{`${game.qty} x ${game.price}`}</p>
								</div>
							</div>
						)
					})}
					<div className='total-wrapper'>
						<div>{`Total: ${Math.floor(total * 100) / 100}€`}</div>
					</div>
				</div>

				<div className='address-details-wrapper'>
					<div className='title-checkout'>Detalles Envío</div>
					<p>{`${userData.name} ${userData.surnames}`}</p>
					<p>{userData.phoneNumber}</p>
					<p>{userData.street}</p>
					<p>{userData.secondLineStreet}</p>
					<p>{userData.postalCode}</p>
					<p>{userData.city}</p>
				</div>

				<div className='payment-logo-wrapper'>
					<div className='title-checkout'>Pago</div>
					<img
						src='https://uniemprendia.es/wp-content/uploads/2018/10/Visa-MasterCard-1024x393.png'
						alt=''
					/>
				</div>

				<Elements stripe={stripePromise}>
					<CardForm
						handleSubmitPayment={handleSubmitPayment}
						previousStep={previousStep}
					/>
				</Elements>
			</div>
		</div>
	)
}
