import { useNavigate } from 'react-router-dom'

import { VscClose, VscDiffRemoved, VscDiffAdded } from 'react-icons/vsc'

import { useCartContext } from '../../contexts/cart/cart-context'
import { useAuthContext } from '../../contexts/auth-context'

export default function Basket({
	handleIconLogin,
	setMessageRegister,
	handleIconBasket
}) {
	const { total, basket, updateItemBasket, deleteItemBasket } = useCartContext()
	const { loggedUser } = useAuthContext()

	const navigate = useNavigate()

	const handlePurchaseBotton = () => {
		if (Object.keys(loggedUser).length) {
			setMessageRegister(false)
			navigate(`/checkout/${loggedUser.id}`)
			handleIconBasket()
		} else {
			setMessageRegister(true)
			handleIconLogin()
		}
	}

	return (
		<div>
			<div className='items-basket-wrapper'>
				{basket.length ? <div className='basket-title'>Cesta</div> : null}
				{basket.map(itemBasket => {
					return (
						<div key={itemBasket.id} className='item-wrapper'>
							<div className='item-container'>
								<img src={itemBasket.game.imgUrl} />
								<div className='qty-container'>
									<VscDiffRemoved
										className='basket-icon'
										onClick={() =>
											updateItemBasket(itemBasket, 'remove')
										}
									/>
									<span className='title-item'>{itemBasket.qty}</span>
									<VscDiffAdded
										className='basket-icon'
										onClick={() => updateItemBasket(itemBasket, 'add')}
									/>
								</div>
								<div className='title-item'>{itemBasket.game.title}</div>
								<div className='title-item'>{`${
									(Math.round(itemBasket.game.price * itemBasket.qty * 100) / 100).toFixed(2)
								}€`}</div>
								<VscClose
									className='basket-icon'
									onClick={() =>
										deleteItemBasket(itemBasket)
									}
								/>
							</div>
						</div>
					)
				})}
				{basket.length ? (
					<div className='total-wrapper'>
						<div>Total: <span>{`${(Math.round(total * 100) / 100).toFixed(2)}€`}</span></div>
						<button onClick={() => handlePurchaseBotton()}>
							Tramitar pedido
						</button>
					</div>
				) : null}
				{!basket.length ? (
					<div className='empty-basket'>La cesta está vacía</div>
				) : null}
			</div>
		</div>
	)
}
