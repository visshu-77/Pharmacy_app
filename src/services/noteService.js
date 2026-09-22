import { api } from "./api";

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/** Local calendar day [from, to) for a Date, as ISO strings. */
const dayBounds = (day) => {
    const from = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from: from.toISOString(), to: to.toISOString() };
};

export const getDayNote = async (day = new Date()) => {
    const response = await api.get("/note", { params: dayBounds(day), headers: auth() });
    return response.data;
};

export const addNoteEntry = async (entry) => {
    const response = await api.post("/note", entry, { headers: auth() });
    return response.data;
};

export const updateNoteEntry = async (id, changes) => {
    const response = await api.patch(`/note/${id}`, changes, { headers: auth() });
    return response.data;
};

export const deleteNoteEntry = async (id) => {
    const response = await api.delete(`/note/${id}`, { headers: auth() });
    return response.data;
};
