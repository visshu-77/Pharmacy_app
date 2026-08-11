import axios from "axios";

const API = "http://localhost:5000/report";

export const getReportSummary = async (range) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/summary`,
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

export const getTopSellingProducts = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/top-selling-products`,
        {
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
