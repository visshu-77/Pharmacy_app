import axios from "axios";

const API_URL = "http://localhost:5000/supplier";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};


// Get all suppliers
export const getSuppliers = async () => {

    const response = await axios.get(
        `${API_URL}/all-supplier`,
        getAuthConfig()
    );

    return response.data;
};


// Get supplier by ID
export const getSupplierById = async (id) => {

    const response = await axios.get(
        `${API_URL}/single/${id}`,
        getAuthConfig()
    );

    return response.data;
};


// Create supplier
export const createSupplier = async (supplierData) => {

    const response = await axios.post(
        `${API_URL}/create`,
        supplierData,
        getAuthConfig()
    );

    return response.data;
};


// Update supplier
export const updateSupplier = async (id, supplierData) => {

    const response = await axios.put(
        `${API_URL}/update/${id}`,
        supplierData,
        getAuthConfig()
    );

    return response.data;
};


// Delete supplier
export const deleteSupplier = async (id) => {

    const response = await axios.delete(
        `${API_URL}/delete/${id}`,
        getAuthConfig()
    );

    return response.data;
};

export const deleteSelectedSuppliers = async (supplierIds) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API_URL}/delete-selected`,
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
        `${API_URL}/delete-all`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};