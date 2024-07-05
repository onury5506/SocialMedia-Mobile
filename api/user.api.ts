import axios from "axios";
import { RegisterResponseDTO, RegisterUserDTO, UserProfileDTO } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import store from "@/store/store";
import { setProfile } from "@/slices/userSlice";

const baseUrl = `${generalBaseUrl}/user`

export function register(registerDto: RegisterUserDTO): Promise<RegisterResponseDTO> {
    return axios.post(`${baseUrl}/register`, registerDto).then((res)=>{
        
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })
}

export function me(): Promise<UserProfileDTO>{
    return api.get(`${baseUrl}/me`).then((res)=>{
        store.dispatch(setProfile(res.data))
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })
}