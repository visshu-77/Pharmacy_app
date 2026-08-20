import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export const askCustomerQuery = async (question) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/ai/customer-query`,
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