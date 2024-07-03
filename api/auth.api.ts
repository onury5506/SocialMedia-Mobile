import axios from "axios";
import { LoginDto, LoginResponseDto, RefreshDTO } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";

const baseUrl = `${generalBaseUrl}/auth`

export function login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return axios.post(`${baseUrl}/login`, loginDto).then((res)=>{
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })

}

export async function refresh(refreshDto: RefreshDTO): Promise<LoginResponseDto> {
    return axios.post(`${baseUrl}/refresh`, refreshDto).then((res)=>{
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })
}