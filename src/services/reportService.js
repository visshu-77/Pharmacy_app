import axios from "axios";

const API = "http://localhost:5000/report";

export const getReportSummary = async (range, category = 'all') => {
    const token = localStorage.getItem("token");
    const params = {
        range
    };

    if (category !== "all") {
        params.category = category;
    }
    const response = await axios.get(
        `${API}/summary`,
        {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const getSalesOverview = async (range = "thisMonth") => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/sales-overview`,
        {
            params: {
                range
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const getTopSellingProducts = async (sortBy = 'quantity') => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/top-selling-products`,
        {
            params:{
                sortBy
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const getCategoryPerformance = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/category-performance`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getRecentTransactions = async (filters = {}) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/recent-transactions`,
        {
            params: filters,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const exportReport = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/export`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: "blob"
        }
    );

    return response.data;
};