import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import CardForm from './CardForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPES)

export default function ConfirmCheckout({
	basket,
	total,
	userData,
	previousStep,
	handleSubmitPayment
}) {
	return (
		<div className='payment-container'>
			<div className='details-container'>
				<div className='order-details-wrapper'>
					<div className='title-checkout'>Detalles Pedido</div>
					{basket.map(basketGame => {
						return (
							<div key={basketGame.game.id} className='item'>
								<img src={basketGame.game.imgUrl} />
								<div className='title-price-wrapper'>
									<div>{basketGame.game.title}</div>
									<p>{`${basketGame.qty} x ${basketGame.game.price}`}</p>
								</div>
							</div>
						)
					})}
					<div className='total-wrapper'>
						<div>{`Total: ${total.toFixed(2)}€`}</div>
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
	)
}
