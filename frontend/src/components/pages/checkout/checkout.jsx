import { useState, useEffect } from 'react'

import NavBar from '../../nav-bar/nav-bar'
import Footer from '../../footer'
import FormCheckoutData from './form-checkout-data'
import PaymentSuccessful from './payment-successful'
import ConfirmCheckout from './confirm-checkout/confirm-checkout'

import { useCartContext } from '../../../contexts/cart/cart-context'
import { useAuthContext } from '../../../contexts/auth-context'
import { useErrorContext } from '../../../contexts/error-context'

import {
	getAddressesUser,
	executeAddressAction
} from '../../../services/api/address-service'
import { executeUserAction } from '../../../services/api/user-service'

export default function Checkout() {
	const { total, basket, cleaningBasket } = useCartContext()
	const { loggedUser, setLoggedUser, currentAddresses, setCurrentAddresses } =
		useAuthContext()
	const { setError } = useErrorContext()

	const [steps, setSteps] = useState(1)
	const [order, setOrder] = useState({})
	const [userData, setUserData] = useState({
		name: loggedUser.name,
		surnames: loggedUser.surnames,
		phoneNumber: loggedUser.phoneNumber,
		addressId: '',
		isDefaultAddress: false,
		street: '',
		secondLineStreet: '',
		postalCode: '',
		city: ''
	})

	useEffect(() => {
		const fetchAddresses = async () =>
			await getAddressesUser(loggedUser.id)
				.then(addresses => {
					setCurrentAddresses(addresses)
				})
				.catch(error => {
					setError(error)
				})

		if (!currentAddresses.length) {
			fetchAddresses()
		}

		const defaultAddress =
			currentAddresses.find(address => address.default) || currentAddresses[0]
		const { id: addressId, default: isDefaultAddress, ...restAddress } = defaultAddress || {}
		defaultAddress && setUserData({ ...userData, ...restAddress, addressId, isDefaultAddress })
	}, [])

	const previousStep = () => {
		if (steps === 1) return
		setSteps(steps - 1)
	}

	const nextStep = () => {
		if (steps === 3) return
		setSteps(steps + 1)
	}

	const handleSubmitCheckoutData = async data => {
		const { name, surnames, phoneNumber, ...dataAddress } = data

		if (
			dataAddress.street !== userData.street ||
			dataAddress.secondLineStreet !== userData.secondLineStreet ||
			dataAddress.postalCode !== userData.postalCode ||
			dataAddress.city !== userData.city
		) {
			const formatedData = {
				...dataAddress,
				userId: loggedUser.id
			}
			await executeAddressAction(formatedData, 'post')
				.then(newAddress => {
					setCurrentAddresses([...currentAddresses, newAddress])
					setUserData({ ...data, addressId: newAddress.id })
				})
				.catch(error => setError(error))
		} else (
			setUserData({ ...userData, ...data })
		)

		if (phoneNumber !== userData.phoneNumber) {
			const formatedData = { ...loggedUser, phoneNumber }
			await executeUserAction(formatedData, 'put')
				.then(user => {
					setLoggedUser(user)
				})
				.catch(error => setError(error))
		}

		nextStep()
	}

	const handleSubmitPayment = async paymentMethodId => {
		// TODO: Hacer petición /orders/with-items
		
		cleaningBasket()
		nextStep()
	}

	return (
		<div>
			<NavBar />
			<div className='wrapper'>
				{steps === 1 ? (
					<FormCheckoutData
						defaultFormValues={userData}
						handleSubmitFormCheckout={handleSubmitCheckoutData}
					/>
				) : null}

				{steps === 2 ? (
					<ConfirmCheckout
						userData={userData}
						basket={basket}
						total={total}
						previousStep={previousStep}
						handleSubmitPayment={handleSubmitPayment}
					/>
				) : null}
				{steps === 3 ? <PaymentSuccessful order={order} /> : null}
			</div>
			<Footer />
		</div>
	)
}
