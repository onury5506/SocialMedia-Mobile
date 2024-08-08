import store from "@/store/store";
import { baseUrl as generalBaseUrl } from "./api.config";
import { api } from "./api.config";
import { ChatMessageDto, ChatMessageDtoMessageStatusEnum, ChatMessageDtoMessageTypeEnum, ChatMessageSendDto, ChatMessageSendDtoTypeEnum, ChatRoomDto, PrivateChatRoomCreateRequestDto, TranslateResultDtoOriginalLanguageEnum } from "./models";
import { PaginatedDto } from "./paginated.dto";
import { queryClient } from "@/app/_layout";

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

store.subscribe(() => {
    const state = store.getState()
    userId = state.user.profile?.id || ''
})

export function sendMessageQueueAdd(message: ChatMessageSendDto) {
    if (!userId) {
        throw new Error('User not found')
    } else if (!message.content) {
        throw new Error('Message content is empty')
    } else if (message.type !== ChatMessageSendDtoTypeEnum.Text) {
        throw new Error('Message type is not supported')
    }

    const newMessage: ChatMessageDto = {
        _id: "new" + Math.floor(Math.random() * 1000000),
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
            queryClient.setQueryData([`chatRoom:${message.roomId}`], (oldData: any) => {
                if (!oldData) {
                    return;
                }

                const newPages = oldData.pages.map((page: any, index: number) => {
                    if (index == 0) {

                        const newMessageIndex = page.data.findIndex((m: ChatMessageDto) => m._id === newMessage._id)

                        if (newMessageIndex >= 0) {
                            page.data[newMessageIndex] = value
                        }

                        return {
                            ...page,
                            data: [...page.data]
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
            setTimeout(() => {

                queryClient.setQueryData([`chatRoom:${message.roomId}`], (oldData: any) => {
                    if (!oldData) {
                        return;
                    }

                    const firstPage = oldData.pages[0]

                    const newMessageIndex = firstPage.data.findIndex((m: ChatMessageDto) => m._id === newMessage._id)
                    if (newMessageIndex >= 0) {
                        let errorMessage = { ...newMessage }
                        errorMessage.messageStatus = ChatMessageDtoMessageStatusEnum.Error
                        errorMessage.content = {
                            originalLanguage: TranslateResultDtoOriginalLanguageEnum.En,
                            originalText: JSON.stringify(err) || "",
                            translations: {
                                [TranslateResultDtoOriginalLanguageEnum.En]: JSON.stringify(err) || ""
                            }
                        }
                        firstPage.data.splice(newMessageIndex, 1, errorMessage)
                    }

                    return {
                        ...oldData,
                        pages: oldData.pages
                    }
                })

            }, 1000)
        }
    })

    if (sendMessageQueue.length === 1) {
        sendMessageQueueProcess()
    }
}

export async function sendMessageQueueProcess() {
    if (sendMessageQueue.length === 0) {
        return
    }

    const item = sendMessageQueue.shift()!
    await sendMessage(item.message).then(item.resolve).catch(item.reject)

    if (sendMessageQueue.length > 0) {
        sendMessageQueueProcess()
    }
}

export function sendMessageQueueClear() {
    sendMessageQueue.length = 0
}