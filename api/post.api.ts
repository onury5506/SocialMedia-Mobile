import axios from "axios";
import { PostDataDto } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import { PaginatedDto } from "./paginated.dto";

const baseUrl = `${generalBaseUrl}/post`

export function getPostsOfUser(userId: string, page: number):Promise<PaginatedDto<PostDataDto>> {
    return api.get<PaginatedDto<PostDataDto>>(`${baseUrl}/postOf/${userId}/${page}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}