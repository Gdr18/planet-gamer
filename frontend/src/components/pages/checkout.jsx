import { useState } from 'react'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import NavBar from '../nav-bar/nav-bar'
import Footer from '../footer'
import FormAddress from '../checkout/form-address'
import CardForm from '../checkout/card-form'
import PaymentSuccessful from '../checkout/payment-successful'
import Home from './home'

import { useCartContext } from '../../contexts/cart-context'
import { useLoginContext } from '../../contexts/login-context'

export default function Checkout() {
	const [steps, setSteps] = useState(1)

	const { total, basketItems, checkingCheckout } = useCartContext()
	const { loggedUser } = useLoginContext()

	const [user, setUser] = useState({
		name: loggedUser.name,
		surnames: loggedUser.surnames,
		phone_number: loggedUser.phone_number,
		email: loggedUser.email,
		password: '',
		admin: loggedUser.admin
	})

	const [address, setAddress] = useState({
		street: '',
		second_line_street: '',
		postal_code: '',
		city: ''
	})

	const [order, setOrder] = useState({})

	const [stripePromise, setStripePromise] = useState(() =>
		loadStripe(import.meta.env.VITE_STRIPES)
	)

	if (!checkingCheckout & !basketItems.length) {
		return <Home />
	}

	return (
		<div>
			<NavBar />
			<div className='wrapper'>
				{steps === 1 ? (
					<FormAddress
						user={user}
						setUser={setUser}
						address={address}
						setAddress={setAddress}
						loggedUser={loggedUser}
						setSteps={setSteps}
					/>
				) : null}

				{steps === 2 ? (
					<div className='payment-container'>
						<div className='payment-wrapper'>
							<div className='order-details-wrapper'>
								<div className='title-checkout'>Detalles Pedido</div>
								{basketItems.map(game => {
									return (
										<div key={game.id} className='item'>
											<img src={game.img} />
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
								<p>{`${user.name} ${user.surnames}`}</p>
								<p>{user.phone_number}</p>
								<p>{address.street}</p>
								<p>{address.second_line_street}</p>
								<p>{address.postal_code}</p>
								<p>{address.city}</p>
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
									setSteps={setSteps}
									loggedUser={loggedUser}
									setOrder={setOrder}
									order={order}
								/>
							</Elements>
						</div>
					</div>
				) : null}
				{steps === 3 ? <PaymentSuccessful order={order} /> : null}
			</div>
			<Footer />
		</div>
	)
}
