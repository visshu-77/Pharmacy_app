import { api } from "./api";

export const getAllCustomers = async ({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    plan = "all"
} = {}) => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        "/api/admin/customers",
        {
            params: {
                page,
                limit,
                search,
                status,
                plan
            },

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getCustomerById = async (customerId) => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        `/api/admin/customers/${customerId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const updateCustomer = async (
    customerId,
    customerData
) => {

    const token = localStorage.getItem("token");

    const response = await api.put(
        `/api/admin/customers/${customerId}`,
        customerData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const toggleCustomerStatus = async (
    customerId
) => {

    const token = localStorage.getItem("token");

    const response = await api.patch(
        `/api/admin/customers/${customerId}/status`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const deleteCustomer = async (
    customerId
) => {

    const token = localStorage.getItem("token");

    const response = await api.delete(
        `/api/admin/customers/${customerId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getCustomerSubscriptions = async (
    customerId
) => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        `/api/admin/customers/${customerId}/subscriptions`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getAdminDashboard = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        "/api/admin/dashboard",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
