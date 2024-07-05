import axios from "axios";
import { LoginDto, LoginResponseDto, RefreshDTO } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";
import store from "@/store/store";
import { setAuth } from "@/slices/userSlice";

const baseUrl = `${generalBaseUrl}/auth`

export function login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return axios.post(`${baseUrl}/login`, loginDto).then((res)=>{
        store.dispatch(setAuth(res.data))
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })

}

export async function refresh(refreshDto: RefreshDTO): Promise<LoginResponseDto> {
    return axios.post(`${baseUrl}/refresh`, refreshDto).then((res)=>{
        store.dispatch(setAuth(res.data))
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })
}