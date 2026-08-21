// import axios from 'axios';

// export const api = axios.create({
//     baseURL: process.env.REACT_APP_API_URL,
//     headers: {
//         "Content-Type": "application/json",
//     }
// });

// export const productApi = axios.create({
//     baseURL: process.env.REACT_APP_PRODUCT_URL,
//     headers: {
//         "Content-Type": "application/json",
//     }
// });


import axios from "axios";

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,

    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    }
});

export const productApi = axios.create({
    baseURL: process.env.REACT_APP_PRODUCT_URL,

    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    }
});