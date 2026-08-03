import axios from 'axios';

const API = "http://localhost:5000/order";

export const createOrder = async (orderData) => {
    const token = localStorage.getItem("token");
    console.log("token is =====>", token);

    const response = await axios.post(
        `${API}/create-order`,
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};