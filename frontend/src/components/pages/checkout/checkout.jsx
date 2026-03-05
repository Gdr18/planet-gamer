import { useState, useEffect } from 'react'

import NavBar from '../../nav-bar/NavBar'
import Footer from '../../Footer'
import FormCheckoutData from './FormCheckoutData'
import PaymentSuccessful from './PaymentSuccessful'
import ConfirmCheckout from './confirm-checkout/ConfirmCheckout'

import { useCartContext } from '../../../contexts/cart-context/CartContext'
import { useAuthContext } from '../../../contexts/AuthContext'

import { useApiWithErrors } from '../../../hooks/useApiWithErrors'

import {
	getAddressesUser,
	executeAddressAction
} from '../../../services/api/address-service'
import { executeUserAction } from '../../../services/api/user-service'
import { executePayment } from '../../../services/api/payment-service'
import { deleteBasketsUser } from '../../../services/api/basket-service'


export default function Checkout() {
	const { total, basket, cleaningBasket } = useCartContext()
	const { loggedUser, setLoggedUser, currentAddresses, setCurrentAddresses } =
		useAuthContext()

	const { callApi } = useApiWithErrors()

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
			callApi(() => getAddressesUser(loggedUser.id)).then(({ ok, response }) => {
				if (ok) {
					setCurrentAddresses(response)
				}
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
			const { ok, response } = await callApi(() =>
				executeAddressAction('post', formatedData)
			)
			if (ok) {
				setCurrentAddresses([...currentAddresses, response])
				setUserData({ ...data, addressId: response.id })
			}
		} else setUserData({ ...userData, ...data })

		if (
			name === loggedUser.name &&
			(!loggedUser.surnames || !loggedUser.phoneNumber)
		) {
			const formatedData = { ...loggedUser, phoneNumber, surnames }
			const { ok, response } = await callApi(() =>
				executeUserAction('put', formatedData)
			)
			if (ok) setLoggedUser(response)
		}

		nextStep()
	}

	const handleSubmitPayment = async (card, stripe) => {
		if (!stripe) {
			return {
				ok: false,
				message: 'No se ha podido inicializar el pago. Inténtalo de nuevo.'
			}
		}

		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: 'card',
			card
		})

		if (error) {
			return { ok: false, message: error.message }
		}

		const paymentData = {
			order: {
				phoneNumber: userData.phoneNumber,
				addressee: `${userData.name} ${userData.surnames}`,
				userId: loggedUser.id,
				addressId: userData.addressId,
				total
			},
			items: basket.map(item => ({
				price: item.game.price,
				qty: item.qty,
				gameId: item.game.id
			})),
			payment: { paymentMethodId: paymentMethod.id }
		}

		const { ok: okPayment, response: responsePayment } = await callApi(() =>
			executePayment(paymentData)
		)
		
		console.log(responsePayment, 'responsePayment')
		if (!okPayment) {
			return {
				ok: false,
				message: responsePayment?.message || 'Ha ocurrido un error al procesar el pago. Inténtalo de nuevo.'
			}
		}

		if (responsePayment.status === 'requires_action') {
			const { error: errorConfirm } = await stripe.confirmCardPayment(
				responsePayment.client_secret
			)
			if (errorConfirm) {
				return { ok: false, message: errorConfirm.message }
			}
		}

		setOrder(responsePayment.order)

		cleaningBasket()
		await callApi(() => deleteBasketsUser(loggedUser.id))
		nextStep()
		return { ok: true, message: 'Pago realizado correctamente' }
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
