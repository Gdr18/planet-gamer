import { axiosInstance } from './api-client'

import { handleErrors } from '../../core/errors'

export const executeBasketAction = async (basketItemData, methodHTTP) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    return await axiosInstance({
        method: methodHTTP,
        url: `/basket-items/${methodHTTP !== 'post' ? basketItemData.id : ''}`,
        data: methodHTTP !== 'delete' ? basketItemData : null,
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.data)
        .catch(error => {
            return handleErrors(error, () => executeBasketAction(basketItemData, methodHTTP))
        })
}


export const deleteBasketsUser = async userId => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    return await axiosInstance({
        method: 'delete',
        url: `/baskets/users/${userId}`,
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.data)
        .catch(error => {
            return handleErrors(error, () => deleteBasketsUser(userId))
        })
}