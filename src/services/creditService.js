import { api } from "./api";

/** Udhar khata — credit customers and their ledgers. */

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ----------------------------------------------------------- customers

export const getCreditCustomers = async (params = {}) => {
    const response = await api.get("/udhar/customer/all", { params, headers: auth() });
    return response.data;
};

export const getCreditCustomer = async (id) => {
    const response = await api.get(`/udhar/customer/single/${id}`, { headers: auth() });
    return response.data;
};

export const createCreditCustomer = async (customer) => {
    const response = await api.post("/udhar/customer/create", customer, { headers: auth() });
    return response.data;
};

export const updateCreditCustomer = async (id, changes) => {
    const response = await api.put(`/udhar/customer/update/${id}`, changes, { headers: auth() });
    return response.data;
};

// -------------------------------------------------------------- ledger

/**
 * Goods or an amount given on credit.
 * `items` makes it a real sale (stock moves); `amount` alone is a plain line.
 */
export const recordCreditSale = async (entry) => {
    const response = await api.post("/udhar/credit", entry, { headers: auth() });
    return response.data;
};

export const recordPayment = async (payment) => {
    const response = await api.post("/udhar/payment", payment, { headers: auth() });
    return response.data;
};

export const getLedger = async (params) => {
    const response = await api.get("/udhar/transactions", { params, headers: auth() });
    return response.data;
};

/** Cancels an entry by writing an opposite one — nothing is deleted. */
export const reverseTransaction = async (id, reason) => {
    const response = await api.post(`/udhar/transaction/${id}/reverse`, { reason }, { headers: auth() });
    return response.data;
};

export const updateTransaction = async (id, changes) => {
    const response = await api.patch(`/udhar/transaction/${id}`, changes, { headers: auth() });
    return response.data;
};

export const getUdharSummary = async (params = {}) => {
    const response = await api.get("/udhar/summary", { params, headers: auth() });
    return response.data;
};

/** The polite reminder text, composed by the server. Nothing is sent. */
export const getReminder = async (id) => {
    const response = await api.get(`/udhar/customer/${id}/reminder`, { headers: auth() });
    return response.data;
};

/**
 * Downloads the statement as a CSV built from the saved ledger.
 * The file needs the auth header, so it is fetched and handed to the browser
 * rather than linked to directly.
 */
export const exportStatementCsv = async ({ customerId, from, to, customerName = "customer" }) => {
    const response = await api.get("/udhar/statement/export", {
        params: { customerId, ...(from ? { from } : {}), ...(to ? { to } : {}) },
        headers: auth(),
        responseType: "blob"
    });

    const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = `udhar-${customerName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return {
        rows: Number(response.headers["x-statement-rows"] || 0),
        truncated: response.headers["x-statement-truncated"] === "true"
    };
};

/**
 * A key that makes a write safe to retry: the server stores it and returns
 * the original entry instead of saving a second one. Generated once per
 * form opening, so a double-tapped button cannot become two payments.
 */
export const newIdempotencyKey = () =>
    `sf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
