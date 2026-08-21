import { api } from "./api";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getSuppliers = async () => {

    const response = await api.get(
        `/supplier/all-supplier`,
        getAuthConfig()
    );

    return response.data;
};

export const getSupplierById = async (id) => {

    const response = await api.get(
        `/supplier/single/${id}`,
        getAuthConfig()
    );

    return response.data;
};

export const createSupplier = async (supplierData) => {

    const response = await api.post(
        `/supplier/create`,
        supplierData,
        getAuthConfig()
    );

    return response.data;
};

export const updateSupplier = async (id, supplierData) => {

    const response = await api.put(
        `/supplier/update/${id}`,
        supplierData,
        getAuthConfig()
    );

    return response.data;
};

export const deleteSupplier = async (id) => {

    const response = await api.delete(
        `/supplier/delete/${id}`,
        getAuthConfig()
    );

    return response.data;
};

export const deleteSelectedSuppliers = async (supplierIds) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(
        `/supplier/delete-selected`,
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

    const response = await api.delete(
        `/supplier/delete-all`,
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

    const response = await api.get(
        `/supplier/search`,
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