import { useNavigate } from 'react-router-dom'

import { VscClose, VscDiffRemoved, VscDiffAdded } from 'react-icons/vsc'

import { useCartContext } from '../../contexts/cart-context'
import { useLoginContext } from '../../contexts/login-context'

export default function Basket({
	handleIconLogin,
	setMessageRegister,
	handleIconBasket
}) {
	const { total, basketItems, handleGamesBasket } = useCartContext()
	const { loggedUser } = useLoginContext()

	const navigate = useNavigate()

	const handlePurchaseBotton = () => {
		if (loggedUser !== '') {
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
				{basketItems.length ? <div className='basket-title'>Cesta</div> : null}
				{basketItems.map(game => {
					return (
						<div key={game.id} className='item-wrapper'>
							<div className='item-container'>
								<img src={game.img} />
								<div className='qty-container'>
									<VscDiffRemoved
										className='basket-icon'
										onClick={() =>
											handleGamesBasket(game, loggedUser.id, 'remove')
										}
									/>
									<span className='title-item'>{game.qty}</span>
									<VscDiffAdded
										className='basket-icon'
										onClick={() => handleGamesBasket(game, loggedUser.id)}
									/>
								</div>
								<div className='title-item'>{game.title}</div>
								<div className='title-item'>{`${
									(Math.round(game.price * game.qty * 100) / 100).toFixed(2)
								}€`}</div>
								<VscClose
									className='basket-icon'
									onClick={() =>
										handleGamesBasket(game, loggedUser.id, 'delete')
									}
								/>
							</div>
						</div>
					)
				})}
				{basketItems.length ? (
					<div className='total-wrapper'>
						<div>Total: <span>{`${(Math.round(total * 100) / 100).toFixed(2)}€`}</span></div>
						<button onClick={() => handlePurchaseBotton()}>
							Tramitar pedido
						</button>
					</div>
				) : null}
				{!basketItems.length ? (
					<div className='empty-basket'>La cesta está vacía</div>
				) : null}
			</div>
		</div>
	)
}
