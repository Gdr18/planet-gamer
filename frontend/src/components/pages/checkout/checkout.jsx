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
import { postOrderAndItems } from '../../../services/api/order-service'
import { executePayment } from '../../../services/api/payment-service'

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
		if (!currentAddresses.length) {
			getAddressesUser(loggedUser.id)
				.then(addresses => {
					setCurrentAddresses(addresses)
				})
				.catch(error => {
					setError(error)
				})
		}
	}, [loggedUser.id])

	useEffect(() => {
		if (!currentAddresses.length) return

		const defaultAddress =
			currentAddresses.find(address => address.default) || currentAddresses[0]
		const {
			id: addressId,
			default: isDefaultAddress,
			...restAddress
		} = defaultAddress

		defaultAddress &&
			setUserData({ ...userData, ...restAddress, addressId, isDefaultAddress })
	}, [currentAddresses])

	const previousStep = () => {
		if (steps === 1) return
		setSteps(steps - 1)
	}

	const nextStep = () => {
		if (steps === 3) return
		setSteps(steps + 1)
	}

	const handleSubmitCheckoutData = async data => {
		try {
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
				const addressResponse = await executeAddressAction('post', formatedData)
				setCurrentAddresses([...currentAddresses, addressResponse])
				setUserData({ ...data, addressId: addressResponse.id })
			} else setUserData({ ...userData, ...data })

			if (
				name === loggedUser.name &&
				!loggedUser.surnames &&
				!loggedUser.phoneNumber
			) {
				const formatedData = { ...loggedUser, phoneNumber, surnames }
				const userResponse = await executeUserAction('put', formatedData)
				setLoggedUser(userResponse)
			}

			nextStep()
		} catch (error) {
			setError(error)
		}
	}

	const handleSubmitPayment = async paymentMethodId => {
		try {
			const orderData = {
				order: {
					phoneNumber: userData.phoneNumber,
					addressee: `${userData.name} ${userData.surnames}`,
					userId: loggedUser.id,
					addressId: userData.addressId,
					paymentMethodId,
					total
				},
				items: basket.map(item => ({
					price: item.game.price,
					qty: item.qty,
					gameId: item.game.id
				}))
			}

			const orderResponse = await postOrderAndItems(orderData)

			setOrder(orderResponse.order)

			const paymentData = {
				userId: loggedUser.id,
				orderId: orderResponse.order.id,
				paymentMethodId
			}

			const paymentResponse = await executePayment(paymentData)

			cleaningBasket()
			return paymentResponse
		} catch (error) {
			setError(error)
		}
	}

	return (
		<div className='checkout-container'>
			<NavBar />
			{steps === 1 && (
				<FormCheckoutData
					key={userData.addressId}
					defaultFormValues={userData}
					handleSubmitFormCheckout={handleSubmitCheckoutData}
				/>
			)}

			{steps === 2 && (
				<ConfirmCheckout
					userData={userData}
					basket={basket}
					total={total}
					previousStep={previousStep}
					handleSubmitPayment={handleSubmitPayment}
				/>
			)}
			{steps === 3 && <PaymentSuccessful order={order} />}
			<Footer />
		</div>
	)
}
