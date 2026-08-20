import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/api/profile`,
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
        `${API}/api/update-profile`,
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
        `${API}/api/change-password`,
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
        `${API}/api/notification-settings`,
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
        `${API}/api/notification-setting`,
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
        `${API}/api/preferences`,
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
        `${API}/api/preferences`,
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
        `${API}/api/billing-details`,
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
}