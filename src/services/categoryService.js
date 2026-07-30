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
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

export const deleteCategory = async (id) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/delete/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

export const updateCategory = async (id, categoryData) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(
        `${API}/update/${id}`,
        categoryData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

