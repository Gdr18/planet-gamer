import { Link } from 'react-router-dom'

import Ps5Icon from '../icons/ps5-icon'
import Ps4Icon from '../icons/ps4-icon'
import XboxIcon from '../icons/xbox-icon'
import SwitchIcon from '../icons/switch-icon'

export default function LogosWrapper({ handlePlatforms }) {
	return (
		<div
			className={
				handlePlatforms === false
					? 'platforms-wrapper'
					: 'platforms-wrapper-responsive'
			}
		>
			<Link to={'/p/ps5'} className='logos-wrapper'>
				<span className='span-catch'>PS5</span>
				<Ps5Icon className='logos-icons-navigation' />
			</Link>

			<Link to={'/p/ps4'} className='logos-wrapper'>
				<span className='span-catch'>PS4</span>
				<Ps4Icon className='logos-icons-navigation' />
			</Link>

			<Link to={'/p/xbox'} className='logos-wrapper'>
				<span className='span-catch'>Xbox S/X</span>
				<XboxIcon className='logos-icons-navigation' />
			</Link>

			<Link to={'/p/switch'} className='logos-wrapper'>
				<span className='span-catch'>Switch</span>
				<SwitchIcon className='logos-icons-navigation' />
			</Link>
		</div>
	)
}
