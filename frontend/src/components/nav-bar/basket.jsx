import { useNavigate } from 'react-router-dom'

import { VscClose, VscDiffRemoved, VscDiffAdded } from 'react-icons/vsc'

import { useCartContext } from '../../contexts/cart-context'
import { useLoginContext } from '../../contexts/login-context'

export default function Basket({
	handleIconLogin,
	setMessageRegister,
	handleIconBasket
}) {
	const { total, basket, handleGamesBasket } = useCartContext()
	const { loggedUser } = useLoginContext()

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
						<div key={itemBasket.id || itemBasket.game?.id} className='item-wrapper'>
							<div className='item-container'>
								<img src={itemBasket.game?.imgUrl} />
								<div className='qty-container'>
									<VscDiffRemoved
										className='basket-icon'
										onClick={() =>
											handleGamesBasket(itemBasket, 'remove')
										}
									/>
									<span className='title-item'>{itemBasket.qty}</span>
									<VscDiffAdded
										className='basket-icon'
										onClick={() => handleGamesBasket(itemBasket)}
									/>
								</div>
								<div className='title-item'>{itemBasket.game?.title || itemBasket.title}</div>
								<div className='title-item'>{`${
									(Math.round((itemBasket.game?.price || itemBasket.price) * itemBasket.qty * 100) / 100).toFixed(2)
								}€`}</div>
								<VscClose
									className='basket-icon'
									onClick={() =>
										handleGamesBasket(itemBasket, 'delete')
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
