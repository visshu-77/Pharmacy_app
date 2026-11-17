import { api } from "./api";

const authConfig = (extra = {}) => ({
    ...extra,
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...extra.headers
    }
});

export const getLeadDashboard = async (filters = {}) =>
    (await api.get("/leads/dashboard", authConfig({ params: filters }))).data;

export const getLeadReports = async (filters = {}) =>
    (await api.get("/leads/reports", authConfig({ params: filters }))).data;

export const exportLeadReports = async (filters = {}) =>
    (await api.get("/leads/reports/export", authConfig({ params: filters, responseType: "blob" }))).data;

export const getCrmSettings = async () =>
    (await api.get("/leads/settings", authConfig())).data;

export const saveCrmSetting = async (key, values) =>
    (await api.patch(`/leads/settings/${key}`, { values }, authConfig())).data;

export const checkLeadDuplicates = async (payload) =>
    (await api.post("/leads/duplicates/check", payload, authConfig())).data;

export const getLeadDuplicates = async (id) =>
    (await api.get(`/leads/${id}/duplicates`, authConfig())).data;

export const mergeDuplicateLead = async (sourceId, targetLeadId) =>
    (await api.post(`/leads/${sourceId}/merge`, { targetLeadId }, authConfig())).data;

export const recordLeadIncome = async (id, payload) =>
    (await api.post(`/leads/${id}/record-income`, payload, authConfig())).data;

export const getLeadStatuses = async () =>
    (await api.get("/leads/statuses", authConfig())).data;

export const saveLeadStatus = async (payload, id) =>
    (await api.request({
        method: id ? "PATCH" : "POST",
        url: id ? `/leads/statuses/${id}` : "/leads/statuses",
        data: payload,
        ...authConfig()
    })).data;

export const getLeads = async (filters) =>
    (await api.get("/leads", authConfig({ params: filters }))).data;

export const getLead = async (id) =>
    (await api.get(`/leads/${id}`, authConfig())).data;

export const saveLead = async (payload, id) =>
    (await api.request({
        method: id ? "PATCH" : "POST",
        url: id ? `/leads/${id}` : "/leads",
        data: payload,
        ...authConfig()
    })).data;

export const changeLeadStatus = async (id, statusId, amounts = {}) =>
    (await api.patch(`/leads/${id}/status`, { statusId, ...amounts }, authConfig())).data;

export const deleteLead = async (id) =>
    (await api.delete(`/leads/${id}`, authConfig())).data;

export const bulkUpdateLeads = async (ids, update) =>
    (await api.patch("/leads/bulk", { ids, ...update }, authConfig())).data;

export const exportLeads = async (filters) =>
    (await api.get("/leads/export", authConfig({ params: filters, responseType: "blob" }))).data;

export const getLeadPipeline = async (page = 1) =>
    (await api.get("/leads/pipeline", authConfig({ params: { page, limit: 20 } }))).data;

export const getLeadTeamSummary = async () =>
    (await api.get("/leads/team", authConfig())).data;

export const getLeadFollowUps = async (view, page = 1) =>
    (await api.get("/leads/followups", authConfig({ params: { view, page, limit: 30 } }))).data;

export const saveLeadFollowUp = async (payload, id) =>
    (await api.request({
        method: id ? "PATCH" : "POST",
        url: id ? `/leads/followups/${id}` : "/leads/followups",
        data: payload,
        ...authConfig()
    })).data;

export const addLeadActivity = async (id, payload) =>
    (await api.post(`/leads/${id}/activities`, payload, authConfig())).data;

export const convertLead = async (id, payload) =>
    (await api.post(`/leads/${id}/convert`, payload, authConfig())).data;

export const markLeadLost = async (id, payload) =>
    (await api.post(`/leads/${id}/lost`, payload, authConfig())).data;

export const getLeadNotifications = async () =>
    (await api.get("/leads/notifications", authConfig())).data;

export const markLeadNotificationRead = async (id) =>
    (await api.patch(`/leads/notifications/${id}/read`, {}, authConfig())).data;

export const markAllLeadNotificationsRead = async () =>
    (await api.patch("/leads/notifications/read-all", {}, authConfig())).data;
