import { api } from "./api";

export const createSubscription = async (subscriptionData) => {
    const token = localStorage.getItem("token");
    const response = await api.post(
        "/subscription/create",
        subscriptionData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


export const createPaymentOrder = async (data) => {
    const token = localStorage.getItem("token");
    const response = await api.post(
        "/subscription/create-payment",
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


export const verifyPayment = async (data) => {
    const token = localStorage.getItem("token");
    const response = await api.post(
        "/subscription/verify-payment",
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


export const getMySubscription = async () => {
    const token = localStorage.getItem("token");
    const response = await api.get(
        "/subscription/my-subscription",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};