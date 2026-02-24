import { axiosInstance } from "./api-client";
import { handleErrors } from "../../core/handle-error";

export const executePayment = async paymentData => {
    return await axiosInstance.post('/payment', paymentData)
        .then(response => response.data)
        .catch(error => {
            return handleErrors(error)
        })
}