import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/errors'


export const executeOrderAction = async (orderData, methodHTTP) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    return await axiosInstance({
        method: methodHTTP,
        url: `/orders/${methodHTTP !== 'post' ? orderData.id : ''}`,
        data: methodHTTP !== 'delete' ? orderData : null,
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.data)
        .catch(error => {
            return handleErrors(error, () => executeOrderAction(orderData, methodHTTP))
        })
}