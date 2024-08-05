import { getChatRoom, getChatRooms } from "@/api/chat.api";
import { ChatMessageDto, ChatRoomDto } from "@/api/models";
import { ChatListElement } from "@/components/Chat/chatListElement";
import socket from "@/websocket/websocket";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Surface } from "react-native-paper";

export default function Chats() {
    const idListRef = useRef<any>({})
    const [chats, setChats] = useState<ChatRoomDto[]>([]);
    const [lastMessages, setLastMessages] = useState<{ [key: string]: ChatMessageDto }>({})
    const {
        data,
        isFetching,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery({
        queryKey: [`chat:rooms`],
        queryFn: ({ pageParam = 1 }) => getChatRooms(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined
    })

    useEffect(() => {
        socket.on('message', (message: ChatMessageDto) => {

            if (!idListRef.current[message.chatRoom]) {
                getChatRoom(message.chatRoom).then(chat => {
                    if (chat) {
                        setChats(prev => {
                            return [
                                chat,
                                ...prev
                            ]
                        })
                    }
                })
                return
            }

            setLastMessages(prev => {
                return {
                    ...prev,
                    [message.chatRoom]: message
                }
            })

            setChats(prev => {
                const newChats = [...prev]
                const chatIndex = newChats.findIndex(chat => chat._id === message.chatRoom)
                const chat = newChats[chatIndex]
                newChats.splice(chatIndex, 1)
                newChats.unshift(chat)

                return newChats
            })
        })
    }, [])

    useEffect(() => {
        if (!data) {
            return
        }

        const lastPage = data.pages[data.pages.length - 1]
        const newChats = [...chats]

        lastPage.data.forEach(chat => {
            if (!idListRef.current[chat._id]) {
                idListRef.current[chat._id] = true
                newChats.push(chat)
            }
        })

        setChats(newChats)
    }, [data])

    return (
        <Surface style={styles.container} >
            <FlatList
                data={chats}
                keyExtractor={item => item._id}
                renderItem={({ item }) => <ChatListElement {...item} lastMessage={lastMessages[item._id]} />}
                onEndReached={() => hasNextPage && fetchNextPage()}
            />
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});