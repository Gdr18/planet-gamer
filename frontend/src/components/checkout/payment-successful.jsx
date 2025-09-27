import SaturnoIcon from '../icons/saturno-icon'

import { HiOutlineRocketLaunch } from 'react-icons/hi2'

export default function PaymentSuccessful({ order }) {
	return (
		<div className='success-wrapper'>
			<div className='branding'>
				<div>Planet Gamer</div>
				<SaturnoIcon fill='#92e678' width={45} height={45} />
			</div>
			<div className='header-success'>
				<div className='success-icon-team'>
					<div>
						El pago del pedido <span>#{order.id}</span> ha sido realizado con
						éxito!
					</div>
					<HiOutlineRocketLaunch className='icon-rocket' />
				</div>
				<div className='total-success'>
					<span>Importe: </span>
					{`${Math.floor(order.total * 100) / 100}€`}
				</div>
				<div className='thanks'>Gracias por comprar en Planet Gamer!</div>
			</div>
		</div>
	)
}
