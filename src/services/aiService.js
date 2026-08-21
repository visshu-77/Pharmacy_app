import { api } from "./api";

export const askCustomerQuery = async (question) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        `/ai/customer-query`,
        {
            question
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};