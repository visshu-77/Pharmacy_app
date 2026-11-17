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

export const getOrderHistory = async ({ page = 1, limit = 25 } = {}) => {
    const token = localStorage.getItem("token");
    const response = await api.get("/order/history", {
        params: { page, limit },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const deleteOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    const response = await api.delete(`/order/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};