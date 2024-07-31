import { CommentDataWithLikedDto, CreatePostRequestDto, CreatePostResponseDto, PostDataDtoPostStatusEnum, PostDataWithWriterDto, PostLikeDto, PostUnlikeDto } from "./models";
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

export function likePost(postId: string): Promise<void> {
    const postData: PostLikeDto = {
        postId
    }
    return api.post<void>(`${baseUrl}/like`,postData).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function unlikePost(postId: string): Promise<void> {
    const postData: PostUnlikeDto = {
        postId
    }
    return api.post<void>(`${baseUrl}/unlike`,postData).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function deletePost(postId: string): Promise<void> {
    return api.delete<void>(`${baseUrl}/${postId}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getComments( postId: string, page: number): Promise<PaginatedDto<CommentDataWithLikedDto>> {
    return api.get<PaginatedDto<CommentDataWithLikedDto>>(`${baseUrl}/comments/${postId}/${page}`).then(res => {
        return res.data
    }).catch(err => {
        console.log(err)
        throw err?.response?.data
    })
}

export function createComment(postId: string, content: string): Promise<CommentDataWithLikedDto> {
    return api.post<CommentDataWithLikedDto>(`${baseUrl}/comment`, { postId, content }).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function likeComment(commentId: string): Promise<void> {
    return api.post<void>(`${baseUrl}/comment/like`, { commentId }).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function unlikeComment(commentId: string): Promise<void> {
    return api.post<void>(`${baseUrl}/comment/unlike`, { commentId }).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function deleteComment(commentId: string): Promise<void> {
    return api.delete<void>(`${baseUrl}/comment/${commentId}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}