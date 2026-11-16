import { api } from "./api";

export const createCashReceipt = async (receiptData) => {
    const token = localStorage.getItem("token");
    const response = await api.post("/cash-receipts", receiptData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const getCashReceiptHistory = async ({ page = 1, limit = 25 } = {}) => {
    const token = localStorage.getItem("token");
    const response = await api.get("/cash-receipts", {
        params: { page, limit },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};
