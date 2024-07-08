import axios from "axios";
import { BlockUserDTO, FollowUserDTO, MiniUserProfile, RegisterResponseDTO, RegisterUserDTO, UnblockUserDTO, UpdateUserDTO, UpdateUserProfilePictureDTO, UserProfileDTO, UserProfileWithRelationDTO } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import store from "@/store/store";
import { setProfile } from "@/slices/userSlice";
import { PaginatedDto } from "./paginated.dto";

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

export function getFollowers(userId: string, page: number): Promise<PaginatedDto<MiniUserProfile>> {
    return api.get(`${baseUrl}/followers/${userId}/${page}`).then((res) => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getFollowings(userId: string, page: number): Promise<PaginatedDto<MiniUserProfile>> {
    return api.get(`${baseUrl}/followings/${userId}/${page}`).then((res) => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function follow(userId: string): Promise<void> {
    const data: FollowUserDTO = {
        id: userId
    }
    return api.post(`${baseUrl}/follow`, data).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}

export function unfollow(userId: string): Promise<void> {
    const data: FollowUserDTO = {
        id: userId
    }
    return api.post(`${baseUrl}/unfollow`, data).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}

export function block(userId: string): Promise<void> {
    const data: BlockUserDTO = {
        id: userId
    }
    return api.post(`${baseUrl}/block`, data).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}

export function unblock(userId: string): Promise<void> {
    const data: UnblockUserDTO = {
        id: userId
    }
    return api.post(`${baseUrl}/unblock`, data).then(() => {
        return;
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getProfile(userId: string): Promise<UserProfileWithRelationDTO> {
    return api.get(`${baseUrl}/profile/${userId}`).then((res) => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}