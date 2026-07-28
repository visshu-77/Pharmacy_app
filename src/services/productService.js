import axios from "axios";

const API = "http://localhost:5000/product";

export const getProducts = async () => {
    const token = localStorage.getItem("token");
    console.log("token is =====>",token)

    const response = await axios.get(`${API}/get`,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const addProduct = async (productData) => {
    const token = localStorage.getItem("token");
    console.log("token is =====>",token)

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