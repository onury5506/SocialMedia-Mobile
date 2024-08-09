import store from "@/store/store";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import { ChatMessageDto, ChatMessageDtoMessageStatusEnum, ChatMessageDtoMessageTypeEnum, ChatMessageSendDto, ChatMessageSendDtoTypeEnum, ChatRoomDto, PrivateChatRoomCreateRequestDto, TranslateResultDtoOriginalLanguageEnum } from "./models";
import { PaginatedDto } from "./paginated.dto";
import { queryClient } from "@/app/_layout";
import EventEmitter from "events";

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
    return api.post<ChatMessageDto>(`${baseUrl}/message`,
        message
    ).then(res => {
        return res.data
    }).catch(err => {
        throw err?.response?.data
    })
}

export interface SendMessageQueueItem {
    message: ChatMessageSendDto,
    resolve: (value: ChatMessageDto) => void,
    reject: (err: any) => void
}

const sendMessageQueue: SendMessageQueueItem[] = []
let userId = store.getState().user.profile?.id || ''

export const newMessageForRoom = new EventEmitter();

store.subscribe(() => {
    const state = store.getState()
    userId = state.user.profile?.id || ''
})

let c = 0

export function sendMessageQueueAdd(message: ChatMessageSendDto) {
    if (!userId) {
        throw new Error('User not found')
    } else if (!message.content) {
        throw new Error('Message content is empty')
    } else if (message.type !== ChatMessageSendDtoTypeEnum.Text) {
        throw new Error('Message type is not supported')
    }

    const newMessageId = "new" + (c++)

    newMessageForRoom.emit("message", message.roomId)

    const newMessage: ChatMessageDto = {
        _id: newMessageId,
        chatRoom: message.roomId,
        sender: userId,
        messageType: ChatMessageDtoMessageTypeEnum.Text,
        messageStatus: ChatMessageDtoMessageStatusEnum.Pending,
        publishedAt: new Date(),
        content: {
            originalLanguage: TranslateResultDtoOriginalLanguageEnum.En,
            originalText: message.content || "",
            translations: {
                [TranslateResultDtoOriginalLanguageEnum.En]: message.content || ""
            }
        }
    }

    queryClient.setQueryData([`chat:message:last:${message.roomId}`], newMessage)

    queryClient.setQueryData([`chatRoom:${message.roomId}`], (oldData: any) => {
        if (!oldData) {
            return;
        }

        const newPages = oldData.pages.map((page: any, index: number) => {
            if (index == 0) {
                return {
                    ...page,
                    data: [newMessage, ...page.data]
                }
            }
            return page
        })

        return {
            ...oldData,
            pages: newPages
        }
    })

    sendMessageQueue.push({
        message,
        resolve: (value: ChatMessageDto) => {
            newMessageForRoom.emit(newMessageId, true, null)
            queryClient.setQueryData([`chatRoom:${message.roomId}`], (oldData: any) => {
                if (!oldData) {
                    return;
                }

                const newPages = oldData.pages.map((page: any, index: number) => {
                    if(index == 0){
                        const newMessageIndex = page.data.findIndex((m: ChatMessageDto) => m._id === newMessage._id)

                        if(newMessageIndex == -1){
                            return page
                        }

                        return {
                            ...page,
                            data: page.data.map((m: ChatMessageDto)=>{
                                if(m._id == newMessage._id){
                                    return value
                                }
                                return m
                            })
                        }
                    }
                    return page
                })

                return {
                    ...oldData,
                    pages: newPages
                }
            })
        },
        reject: (err) => {
            newMessageForRoom.emit(newMessageId, false, err)
            queryClient.setQueryData([`chatRoom:${message.roomId}`], (oldData: any) => {
                if (!oldData) {
                    return;
                }

                const newPages = oldData.pages.map((page: any, index: number) => {
                    if(index == 0){
                        const newMessageIndex = page.data.findIndex((m: ChatMessageDto) => m._id === newMessage._id)

                        if(newMessageIndex == -1){
                            return page
                        }

                        return {
                            ...page,
                            data: page.data.map((m: ChatMessageDto)=>{
                                if(m._id == newMessage._id){
                                    m.messageStatus = ChatMessageDtoMessageStatusEnum.Error
                                    m.publishedAt = new Date()
                                    return {...m}
                                }
                                return m
                            })
                        }
                    }

                    return page

                })

                return {
                    ...oldData,
                    pages: newPages
                }
            })
        }
    })

    if (sendMessageQueue.length === 1) {
        sendMessageQueueProcess()
    }

    return newMessageId
}

export async function sendMessageQueueProcess() {
    if (sendMessageQueue.length === 0) {
        return
    }

    const item = sendMessageQueue[0]
    await sendMessage(item.message).then(item.resolve).catch(item.reject)
    sendMessageQueue.shift()

    if (sendMessageQueue.length > 0) {
        sendMessageQueueProcess()
    }
}

export function sendMessageQueueClear() {
    sendMessageQueue.length = 0
}