import axios from "axios";


const API = "http://localhost:5000/product";

export const getProducts = async () => {
    const token = localStorage.getItem("token");
    console.log("token is =====>",token)

    const response = await axios.get(`${API}/get`,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const addProduct = async (productData) => {
    const token = localStorage.getItem("token");
    console.log("token is =====>",token)

    const response = await axios.post(
        `${API}/add`,
        productData,
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const deleteProduct = async(id) => {
    const token = localStorage.getItem("token");
    
    const response = await axios.delete(
        `${API}/delete/${id}`,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export const updateProduct = async(id, productData) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(
        `${API}/update/${id}`,
        productData,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export const exportProducts = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/exports`,
        {
            headers:{
                Authorization: `Bearer ${token}`
            },
            responseType: "blob"
        }
    );
    return response.data;
}

export const importProducts = async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file",file);
    const response = await axios.post(
        `${API}/imports`,
        formData,
        {
            headers:{
                Authorization:`Bearer ${token}`
            },
        }
    );
    return response.data;
}

export const singleProduct = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/single/${id}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }); 
        return response.data;
}

export const searchProducts = async (search) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/search`,
        {
            params: {
                search
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const deleteSingleProducts = async (productIds) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/delete-selected`,
        {
            data:{
                productIds
            },
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );
    return response.data;
}

export const deleteAllProducts = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API}/delete-all`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );
    return response.data;
}