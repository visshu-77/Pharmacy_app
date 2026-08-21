import { api } from "./api";

export const createOrder = async (orderData) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        `/order/create-order`,
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};