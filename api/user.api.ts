import axios from "axios";
import { RegisterResponseDTO, RegisterUserDTO, UpdateUserDTO, UpdateUserProfilePictureDTO, UserProfileDTO } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import store from "@/store/store";
import { setProfile } from "@/slices/userSlice";

const baseUrl = `${generalBaseUrl}/user`

export function register(registerDto: RegisterUserDTO): Promise<RegisterResponseDTO> {
    return axios.post(`${baseUrl}/register`, registerDto).then((res) => {

        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function me(): Promise<UserProfileDTO> {
    return api.get(`${baseUrl}/me`).then((res) => {
        store.dispatch(setProfile(res.data))
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function updateUser(updateUserDto: UpdateUserDTO): Promise<void> {
    return api.put(`${baseUrl}/me`, updateUserDto).then(() => {
        return me()
    }).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}

export function updateProfilePicture(uri: string, filename:string, mimeType: string, size: number): Promise<void> {

    const form = new FormData()

    // @ts-ignore
    form.append('file', {
        uri,
        name: filename,
        type: mimeType
    })
    form.append('left', '0')
    form.append('top', '0')
    form.append('size', size.toString())
    
    return api.put(`${baseUrl}/me/profilePicture`, form, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(() => {
        return me()
    }).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}

export function deleteProfilePicture(){
    return api.delete(`${baseUrl}/me/profilePicture`).then(() => {
        return me()
    }).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}