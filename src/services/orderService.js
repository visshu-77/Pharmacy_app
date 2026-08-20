import axios from 'axios';
const API = process.env.REACT_APP_API_URL;

export const createOrder = async (orderData) => {
    const token = localStorage.getItem("token");
    console.log("token is =====>", token);

    const response = await axios.post(
        `${API}/order/create-order`,
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};