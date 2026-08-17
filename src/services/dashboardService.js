import axios from "axios";

const API = "http://localhost:5000/dashboard";

export const getDashboardSummary = async () => {

    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/summary`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};