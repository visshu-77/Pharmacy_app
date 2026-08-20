import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export const createSubscription = async (subscriptionData) => {

    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/subscription/create`,
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

    const response = await axios.post(
        `${API}/subscription/create-payment`,
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

    const response = await axios.post(
        `${API}/subscription/verify-payment`,
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

    const response = await axios.get(
        `${API}/subscription/my-subscription`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};