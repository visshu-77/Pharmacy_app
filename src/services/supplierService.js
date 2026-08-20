import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getSuppliers = async () => {

    const response = await axios.get(
        `${API}/supplier/all-supplier`,
        getAuthConfig()
    );

    return response.data;
};

export const getSupplierById = async (id) => {

    const response = await axios.get(
        `${API}/supplier/single/${id}`,
        getAuthConfig()
    );

    return response.data;
};

export const createSupplier = async (supplierData) => {

    const response = await axios.post(
        `${API}/supplier/create`,
        supplierData,
        getAuthConfig()
    );

    return response.data;
};

export const updateSupplier = async (id, supplierData) => {

    const response = await axios.put(
        `${API}/supplier/update/${id}`,
        supplierData,
        getAuthConfig()
    );

    return response.data;
};

export const deleteSupplier = async (id) => {

    const response = await axios.delete(
        `${API}/supplier/delete/${id}`,
        getAuthConfig()
    );

    return response.data;
};

export const deleteSelectedSuppliers = async (supplierIds) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/supplier/delete-selected`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                supplierIds
            }
        }
    );

    return response.data;
};

export const deleteAllSuppliers = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/supplier/delete-all`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const searchSuppliers = async (name) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/supplier/search`,
        {
            params: {
                name
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};