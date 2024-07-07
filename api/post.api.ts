import { CreatePostRequestDto, CreatePostResponseDto, PostDataDtoPostStatusEnum, PostDataWithWriterDto } from "./models";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import { PaginatedDto } from "./paginated.dto";
import * as FileSystem from 'expo-file-system';

const baseUrl = `${generalBaseUrl}/post`

export function getPostsOfUser(userId: string, page: number): Promise<PaginatedDto<PostDataWithWriterDto>> {
    return api.get<PaginatedDto<PostDataWithWriterDto>>(`${baseUrl}/postOf/${userId}/${page}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function createPost(post: CreatePostRequestDto): Promise<CreatePostResponseDto> {
    return api.post<CreatePostResponseDto>(`${baseUrl}`, post).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getPostStatus(postId: string): Promise<PostDataDtoPostStatusEnum> {
    return api.get<PostDataDtoPostStatusEnum>(`${baseUrl}/postStatus/${postId}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export async function uploadFileWithSignedUrl(signedUrl: string, fileUri:string, mimeType:string, size:number) {
    const res = await FileSystem.uploadAsync(signedUrl, fileUri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        
        headers: {
            'Content-Type': mimeType,
            'x-goog-content-length-range': `0,${size}`,
            'Content-Length': size.toString()
        }
    })

    if(res.status !== 200) {
        throw new Error(res.body)
    }
}