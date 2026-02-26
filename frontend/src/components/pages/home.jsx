import { Link } from 'react-router-dom'
import Lost from '../../assets/lost.mp4'

import Ps5Icon from '../icons/Ps5Icon'
import Ps4Icon from '../icons/Ps4Icon'
import XboxIcon from '../icons/XboxIcon'
import SwitchIcon from '../icons/SwitchIcon'

import Footer from '../Footer'

export default function Home() {
	return (
		<div className='video-wrapper'>
			<div className='overlay'></div>
			<video muted loop autoPlay>
				<source src={Lost} type='video/mp4' />
			</video>
			<div className='welcome-container'>
				<div className='welcome'>
					<div>Welcome to</div>
					<h1>Planet Gamer</h1>
					<p>Videogames</p>
				</div>
				<div className='logos-wrapper'>
					<Link to={'/platform/ps5'}>
						<Ps5Icon className='logos-icons-home' />
					</Link>
					<Link to={'/platform/ps4'}>
						<Ps4Icon className='logos-icons-home' />
					</Link>
					<Link to={'/platform/xbox'}>
						<XboxIcon className='logos-icons-home' />
					</Link>
					<Link to={'/platform/switch'}>
						<SwitchIcon className='logos-icons-home' />
					</Link>
				</div>
				<Footer />
			</div>
		</div>
	)
}
