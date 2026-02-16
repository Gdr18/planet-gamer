import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useErrorContext } from '../contexts/error-context'

import SaturnoIcon from './icons/saturno-icon'

export const ErrorModal = () => {
	const { error, clearError } = useErrorContext()
	const navigate = useNavigate()

	let timeout

	useEffect(() => {
		if (!Object.keys(error).length) return
		if (error.errorUi === 'not_modal') return

		timeout = setTimeout(() => {
			handleCase()
		}, 5000)
		return () => clearTimeout(timeout)
	}, [error])

	const handleCase = () => {
		switch (error.errorUi) {
			case 'go_home':
				navigate('/')
				break
			case 'not_token':
				navigate('/platform/ps4')
				break
		}
		clearError()
	}

	const handleManualClose = () => {
		clearTimeout(timeout)
		handleCase()
	}

	if (!Object.keys(error).length) return

	return (
		<div className='error-modal'>
			<div className='error-content'>
				<div className='title-logo-container'>
					<SaturnoIcon fill='#92e678' width={45} height={45} />
					<span>Planet Gamer</span>
				</div>
				<div className='error-information-container'>
					<h2>Error</h2>
					<p>{error?.message}</p>
					<button onClick={handleManualClose}>Cerrar</button>
				</div>
			</div>
		</div>
	)
}
