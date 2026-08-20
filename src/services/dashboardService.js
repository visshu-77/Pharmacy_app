import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export const getDashboardSummary = async () => {

    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/dashboard/summary`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};