// import axios from "axios";
import { api } from "./api";

export const addCategory = async (productData) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        `/category/add`,
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

    const response = await api.get(
        `/category/get`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

export const deleteCategory = async (id) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(
        `/category/delete/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    return response.data;
}

export const updateCategory = async (id, categoryData) => {
    const token = localStorage.getItem("token");

    const response = await api.put(
        `/category/update/${id}`,
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

    const response = await api.get(
        `/category/single/${id}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response.data;
}

export const deleteSingleCategories = async(ids) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(
        `/category/delete-selected`,
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

    const response = await api.delete(
        `/category/delete-all`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response.data;
}
