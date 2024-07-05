import { selectAuth } from "@/slices/userSlice";
import store from "@/store/store";
import axios from "axios"

export const baseUrl = "http://192.168.1.108:3000"

export const api = axios.create({
    baseURL: baseUrl
})

const getToken = () => {
    const state = store.getState();
    const auth = selectAuth(state);
    return auth || null;
};

api.interceptors.request.use((config)=>{
    const token = getToken()
    if(token){
        config.headers.authorization = token.accessToken
    }
    return config
})