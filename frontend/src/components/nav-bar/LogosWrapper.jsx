import { Link } from 'react-router-dom'

import Ps5Icon from '../icons/Ps5Icon'
import Ps4Icon from '../icons/Ps4Icon'
import XboxIcon from '../icons/XboxIcon'
import SwitchIcon from '../icons/SwitchIcon'

export default function LogosWrapper({ handlePlatforms }) {
	return (
		<div
			className={
				handlePlatforms === false
					? 'platforms-wrapper'
					: 'platforms-wrapper-responsive'
			}
		>
			<Link to={'/platform/ps5'} className='logos-wrapper'>
				<span className='span-catch'>PS5</span>
				<Ps5Icon className='logos-icons-navigation' />
			</Link>

			<Link to={'/platform/ps4'} className='logos-wrapper'>
				<span className='span-catch'>PS4</span>
				<Ps4Icon className='logos-icons-navigation' />
			</Link>

			<Link to={'/platform/xbox'} className='logos-wrapper'>
				<span className='span-catch'>Xbox Series</span>
				<XboxIcon className='logos-icons-navigation' />
			</Link>

			<Link to={'/platform/switch'} className='logos-wrapper'>
				<span className='span-catch'>Switch</span>
				<SwitchIcon className='logos-icons-navigation' />
			</Link>
		</div>
	)
}
