import axios from "axios";

const API = "http://localhost:5000/ai";

export const askCustomerQuery = async (question) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/customer-query`,
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