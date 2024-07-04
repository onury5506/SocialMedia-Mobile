import axios from "axios";
import { RegisterResponseDTO, RegisterUserDTO, User } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";

const baseUrl = `${generalBaseUrl}/user`

export function register(registerDto: RegisterUserDTO): Promise<RegisterResponseDTO> {
    return axios.post(`${baseUrl}/register`, registerDto).then((res)=>{
        return res.data
    }).catch(err=>{
        throw err?.response?.data
    })
}