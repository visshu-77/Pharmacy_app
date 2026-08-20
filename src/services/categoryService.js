import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export const addCategory = async (productData) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/category/add`,
        productData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

export const getCategory = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/category/get`,
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
        `${API}/category/delete/${id}`,
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
        `${API}/category/update/${id}`,
        categoryData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

export const viewCategory = async(id) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/category/single/${id}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response.data;
}

export const deleteSingleCategories = async(ids) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/category/delete-selected`,
        {
            data:{
                ids
            },
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response.data;
}

export const deleteAllCategories = async() => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/category/delete-all`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response.data;
}
