import { api } from "./api.js";

/** Step 1 of signup: validate the form and email a verification code. */
export const sendSignupOtp = async (userData) => {
    const response = await api.post("/api/register/send-otp", userData);
    return response.data;
};

/** Ask for a fresh code for a signup already in progress. */
export const resendSignupOtp = async (email) => {
    const response = await api.post("/api/register/resend-otp", { email });
    return response.data;
};

/** Step 2 of signup: confirm the code, which creates the account. */
export const verifySignupOtp = async ({ email, otp }) => {
    const response = await api.post("/api/register/verify-otp", { email, otp });
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await api.post("/api/login", userData);
    return response.data;
};
