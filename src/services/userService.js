import axios from "axios";

const API = "http://localhost:5000/api";

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/profile`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const updateProfile = async (profileData) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(
        `${API}/update-profile`,
        profileData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};