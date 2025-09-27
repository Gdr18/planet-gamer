import { Link } from 'react-router-dom'

import { LiaUserAstronautSolid } from 'react-icons/lia'

export default function Footer() {
	return (
		<div className='footer'>
			<div className='contact-wrapper'>
				<Link to='/contact'>About Us/Contact</Link>
				<LiaUserAstronautSolid className='contact-icon' />
			</div>
			<p>
				Background/app de{' '}
				<a href='https://unsplash.com/es/@brutus?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash'>
					Beat Schuler
				</a>{' '}
				en{' '}
				<a href='https://unsplash.com/es/fotos/noche-estrellada-negra-y-marron-9D2WUVsT9_I?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash'>
					Unsplash
				</a>{' '}
				y background/home de{' '}
				<a href='https://moewalls.com/anime/lost-in-the-galaxy-live-wallpaper/'>
					Moewalls
				</a>
			</p>
		</div>
	)
}
