import { api, productApi} from "./api.js";

export const registerUser = async (userData) => {
    const response = await api.post("/api/register", userData);
    return response.data;
}

export const loginUser = async (userData) => {
  const response = await api.post("/api/login", userData);
  return response.data;
};
      