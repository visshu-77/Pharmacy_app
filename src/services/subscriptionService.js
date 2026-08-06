import axios from "axios";

const API = "http://localhost:5000/subscription";

export const createSubscription = async (subscriptionData) => {

    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/create`,
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
        `${API}/create-payment`,
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
        `${API}/verify-payment`,
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
        `${API}/my-subscription`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};