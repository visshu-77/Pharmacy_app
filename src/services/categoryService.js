import axios from "axios";

const API = "http://localhost:5000/category";

export const addCategory = async (productData) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/add`,
        productData,
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const getCategory = async (productData) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/get`,
        productData,
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}


