import { api } from "./api";

export const getProducts = async () => {
    const token = localStorage.getItem("token");
    console.log("token is =====>",token)

    const response = await api.get(`/product/get`,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const addProduct = async (productData) => {
    const token = localStorage.getItem("token");
    console.log("token is =====>",token)

    const response = await api.post(
        `/product/add`,
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
    
    const response = await api.delete(
        `/product/delete/${id}`,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export const updateProduct = async(id, productData) => {
    const token = localStorage.getItem("token");

    const response = await api.put(
        `/product/update/${id}`,
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

    const response = await api.get(
        `/product/exports`,
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
    const response = await api.post(
        `/product/imports`,
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
    const response = await api.get(
        `/product/single/${id}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }); 
        return response.data;
}

export const searchProducts = async (search) => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        `/product/search`,
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

    const response = await api.delete(
        `/product/delete-selected`,
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

    const response = await api.delete(
        `/product/delete-all`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );
    return response.data;
}