import { api } from "./api";

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        `/api/profile`,
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

    const response = await api.put(
        `/api/update-profile`,
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

export const uploadProfileImage = async (imageFile) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profileImage", imageFile);

    const response = await api.put("/api/profile/image", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const removeProfileImage = async () => {
    const token = localStorage.getItem("token");
    const response = await api.delete("/api/profile/image", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const changePassword = async (data) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        `/api/change-password`,
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
    const response = await api.get(
        `/api/notification-settings`,
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
    const response = await api.put(
        `/api/notification-setting`,
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
    const response = await api.get(
        `/api/preferences`,
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
    const response = await api.put(
        `/api/preferences`,
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
    const response = await api.get(
        `/api/billing-details`,
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
}