import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useErrorContext } from '../contexts/error-context'

export const ErrorModal = () => {
	const { error, clearError } = useErrorContext()
	const navigate = useNavigate()

	useEffect(() => {
		if (!error) return
		if (error.errorUi === 'not_modal') return

		setTimeout(() => {
			handleCase()
		}, 5000)
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
        clearTimeout()
        handleCase()
    }

	if (!error) return null

	return (
		<>
			<div className='error-modal'>
				<div className='error-content'>
					<h2>Error</h2>
					<p>{error.message}</p>
					<button onClick={handleManualClose}>Cerrar</button>
				</div>
			</div>
		</>
	)
}
