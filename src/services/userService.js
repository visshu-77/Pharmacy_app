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

export const changePassword = async (data) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API}/change-password`,
        data,
        {
            headers:{
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"                                                                                                                                                                                                                  
            }   
        }
    );      
    return response.data;
}

export const getNotification = async()=>{
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/notification-settings`,
        {
            headers:{
                Authorization: `Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data
}

export const updateNotification = async(notificationData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API}/notification-setting`,
        notificationData,
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
}

export const getPreferences = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/preferences`,
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
}

export const updatePreferences = async(prefrenceData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API}/preferences`,
        prefrenceData,
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
}

export const getBillingDetails = async() => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/billing-details`,
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
}