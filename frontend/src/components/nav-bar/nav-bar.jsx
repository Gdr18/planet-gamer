import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'

import Login from './login'
import LogosWrapper from './logos-wrapper'
import Basket from './basket'

import { useCartContext } from '../../contexts/cart-context'

import { CgMenu } from 'react-icons/cg'
import { FaUserAstronaut } from 'react-icons/fa'
import { BsFillBasket3Fill } from 'react-icons/bs'
import SaturnoIcon from '../icons/saturno-icon'

export default function NavBar() {
	const [handlePlatforms, setHandlePlatforms] = useState(false)
	const [loginActive, setLoginActive] = useState(false)
	const [basketActive, setBasketActive] = useState(false)
	const [messageRegister, setMessageRegister] = useState(false)

	const { countProducts } = useCartContext()

	const nodeRefLogin = useRef(null)
	const nodeRefBasket = useRef(null)

	const handleIconLogin = () => {
		if (basketActive) {
			setBasketActive(false)
		} else if (handlePlatforms) {
			setHandlePlatforms(false)
		}
		setLoginActive(!loginActive)
	}

	const handleIconBasket = () => {
		if (loginActive) {
			setLoginActive(false)
		} else if (handlePlatforms) {
			setHandlePlatforms(false)
		}
		setBasketActive(!basketActive)
	}

	const handleIconMenu = () => {
		if (loginActive) {
			setLoginActive(false)
		} else if (basketActive) {
			setBasketActive(false)
		}
		setHandlePlatforms(!handlePlatforms)
	}
	return (
		<div className='nav-wrapper'>
			<div className='branding'>
				<CgMenu className='menu-icon' onClick={handleIconMenu} />
				<Link to='/'>PLANET GAMER</Link>
				<Link to='/'>
					<SaturnoIcon fill='#92e678' width={45} height={45} />
				</Link>
			</div>

			<LogosWrapper handlePlatforms={handlePlatforms} />

			<div className='user-basket-wrapper'>
				<FaUserAstronaut className='icons' onClick={handleIconLogin} />
				<CSSTransition
					nodeRef={nodeRefLogin}
					in={loginActive}
					timeout={200}
					classNames='fade'
				>
					<div ref={nodeRefLogin}>
						{loginActive ? (
							<Login
								messageRegister={messageRegister}
								handleIconLogin={handleIconLogin}
							/>
						) : null}
					</div>
				</CSSTransition>
				<div className='container-cart-icon' onClick={handleIconBasket}>
					<BsFillBasket3Fill className='icons' />
					<div className='count-products-wrapper'>
						<span id='count-products'>{countProducts}</span>
					</div>
				</div>
				<CSSTransition
					nodeRef={nodeRefBasket}
					in={basketActive}
					timeout={200}
					classNames='fade'
				>
					<div ref={nodeRefBasket}>
						{basketActive ? (
							<Basket
								setMessageRegister={setMessageRegister}
								handleIconLogin={handleIconLogin}
								handleIconBasket={handleIconBasket}
							/>
						) : null}
					</div>
				</CSSTransition>
			</div>
		</div>
	)
}
