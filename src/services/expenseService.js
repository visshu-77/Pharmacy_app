import { api } from "./api";

const authConfig = (extra = {}) => ({
    ...extra,
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...extra.headers
    }
});

export const getExpenseDashboard = async () =>
    (await api.get("/expenses/dashboard", authConfig())).data;

export const getExpenseTransactions = async (filters) =>
    (await api.get("/expenses/transactions", authConfig({ params: filters }))).data;

export const getExpenseTransaction = async (id) =>
    (await api.get(`/expenses/transactions/${id}`, authConfig())).data;

export const saveExpenseTransaction = async (payload, file, id) => {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (file) formData.append("receipt", file);

    return (await api.request({
        method: id ? "PATCH" : "POST",
        url: id ? `/expenses/transactions/${id}` : "/expenses/transactions",
        data: formData,
        ...authConfig({ headers: { "Content-Type": "multipart/form-data" } })
    })).data;
};

export const deleteExpenseTransaction = async (id) =>
    (await api.delete(`/expenses/transactions/${id}`, authConfig())).data;

export const getExpenseCategories = async () =>
    (await api.get("/expenses/categories", authConfig())).data;

export const saveExpenseCategory = async (payload, id) =>
    (await api.request({
        method: id ? "PATCH" : "POST",
        url: id ? `/expenses/categories/${id}` : "/expenses/categories",
        data: payload,
        ...authConfig()
    })).data;

export const deleteExpenseCategory = async (id) =>
    (await api.delete(`/expenses/categories/${id}`, authConfig())).data;

export const getRecurringExpenses = async () =>
    (await api.get("/expenses/recurring", authConfig())).data;

export const saveRecurringExpense = async (payload, id) =>
    (await api.request({
        method: id ? "PATCH" : "POST",
        url: id ? `/expenses/recurring/${id}` : "/expenses/recurring",
        data: payload,
        ...authConfig()
    })).data;

export const deleteRecurringExpense = async (id) =>
    (await api.delete(`/expenses/recurring/${id}`, authConfig())).data;

export const getExpenseReport = async (from, to) =>
    (await api.get("/expenses/reports", authConfig({ params: { from, to } }))).data;

export const exportExpenseReport = async (from, to) =>
    (await api.get("/expenses/reports/export", authConfig({
        params: { from, to },
        responseType: "blob"
    }))).data;

export const getExpenseReceipt = async (id) =>
    (await api.get(`/expenses/transactions/${id}/receipt`, authConfig({ responseType: "blob" }))).data;
