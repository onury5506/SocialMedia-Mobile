import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import { ChatMessageDto, ChatMessageSendDto, ChatRoomDto, PrivateChatRoomCreateRequestDto } from "./models";
import { PaginatedDto } from "./paginated.dto";

const baseUrl = `${generalBaseUrl}/chat`

export function getChatRooms(page: number): Promise<PaginatedDto<ChatRoomDto>> {
    return api.get<PaginatedDto<ChatRoomDto>>(`${baseUrl}/rooms/${page}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getChatRoom(roomId: string): Promise<ChatRoomDto | null> {
    return api.get<ChatRoomDto | null>(`${baseUrl}/room/${roomId}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getPrivateRoomWithUser(userId: string): Promise<ChatRoomDto | null> {
    return api.get<ChatRoomDto | null>(`${baseUrl}/privateRoom/${userId}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function createPrivateRoom(userId: string): Promise<ChatRoomDto> {
    const postData: PrivateChatRoomCreateRequestDto = {
        userId
    }
    return api.post<ChatRoomDto>(`${baseUrl}/privateRoom`, postData).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getLastMessage(roomId: string): Promise<ChatMessageDto | null> {
    console.log('getLastMessage', roomId, `${baseUrl}/message/last/${roomId}`)
    return api.get<ChatMessageDto | null>(`${baseUrl}/message/last/${roomId}`).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function getMessages(roomId: string, pageDate: number, pageSize: number): Promise<PaginatedDto<ChatMessageDto>> {
    return api.get<PaginatedDto<ChatMessageDto>>(`${baseUrl}/messages/${roomId}/${pageSize}`, {
        params: {
            pageDate
        }
    }).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export function sendMessage(message: ChatMessageSendDto): Promise<ChatMessageDto> {
    return api.post<ChatMessageDto>(`${baseUrl}/message`, {
        message
    }).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}