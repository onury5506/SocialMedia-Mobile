import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import { PostDataWithWriterDto } from "./models";
import { PaginatedDto } from "./paginated.dto";

const baseUrl = `${generalBaseUrl}/feed`

export function getMeFeed(page: number): Promise<PaginatedDto<PostDataWithWriterDto>> {
    return api.get<PaginatedDto<PostDataWithWriterDto>>(`${baseUrl}/me/${page}`).then(res => {
        return res.data
    }).catch(err => {
        console.log(err)
        throw err?.response?.data
    })
}

export function feedRefresh(): Promise<void> {
    return api.post<void>(`${baseUrl}/refresh`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getGlobalFeed(page: number): Promise<PaginatedDto<PostDataWithWriterDto>> {
    return api.get<PaginatedDto<PostDataWithWriterDto>>(`${baseUrl}/global/${page}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}