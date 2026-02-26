import { useCallback } from 'react'
import { useErrorContext } from '../contexts/ErrorContext'

export const useApiWithErrors = () => {
	const { setError } = useErrorContext()

	const callApi = useCallback(
		async request => {
			try {
				const response = await request()
				return {ok: true, response}
			} catch (error) {
				setError(error)
                return {ok: false, response: error}
			}
		},
		[setError]
	)

	return { callApi }
}
