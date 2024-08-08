import { getChatRoom, getChatRooms, newMessageForRoom } from "@/api/chat.api";
import { ChatMessageDto, ChatRoomDto } from "@/api/models";
import { ChatListElement } from "@/components/Chat/chatListElement";
import socket from "@/websocket/websocket";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Dialog, Portal, Searchbar, Surface } from "react-native-paper";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function Chats() {
    const idListRef = useRef<any>({})
    const [chats, setChats] = useState<ChatRoomDto[]>([]);
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
    const [searchText, setSearchText] = useState("")
    const queryClient = useQueryClient()
    const [showImage, setShowImage] = useState<{
        url: string,
        bluredHash: string
    } | null>(null)
    const router = useRouter()

    useEffect(() => {

        function handleNewMessageSendTo(chatRoomId: string) {
            if (!idListRef.current[chatRoomId]) {
                getChatRoom(chatRoomId).then(chat => {
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

            setChats(prev => {
                const newChats = [...prev]
                const chatIndex = newChats.findIndex(chat => chat._id === chatRoomId)
                const chat = newChats[chatIndex]
                newChats.splice(chatIndex, 1)
                newChats.unshift(chat)
                return newChats
            })
        }

        function handleNewMessageFromWebSocket(message: ChatMessageDto) {

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

            queryClient.setQueryData([`chat:message:last:${message.chatRoom}`], message)

            setChats(prev => {
                const newChats = [...prev]
                const chatIndex = newChats.findIndex(chat => chat._id === message.chatRoom)
                const chat = newChats[chatIndex]
                newChats.splice(chatIndex, 1)
                newChats.unshift(chat)
                return newChats
            })

            queryClient.setQueryData([`chatRoom:${message.chatRoom}`], (oldData: any) => {
                if (!oldData) {
                    return;
                }

                const newPages = oldData.pages.map((page: any, index: number) => {
                    if (index == 0) {
                        return {
                            ...page,
                            data: [message, ...page.data]
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

        newMessageForRoom.addListener("message", handleNewMessageSendTo)
        socket.on('message', handleNewMessageFromWebSocket)

        return () => {
            newMessageForRoom.removeListener("message", handleNewMessageSendTo)
            socket.off('message', handleNewMessageFromWebSocket)
        }
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

    useEffect(() => {
        if(searchText.length === 0) {
            return
        }

        const timer = setTimeout(() => {
            router.push(`/search?searchStartText=${encodeURIComponent(searchText)}`)
            setSearchText("")
        }, 500)

        return () => {
            clearTimeout(timer)
        }
    }, [searchText])

    return (
        <Surface style={styles.container} >
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchText}
                value={searchText}
            />
            <FlatList
                data={chats}
                keyExtractor={item => item._id}
                renderItem={({ item }) => <ChatListElement {...item} showImage={setShowImage} />}
                onEndReached={() => hasNextPage && fetchNextPage()}
            />
            <Portal>
                <Dialog visible={!!showImage?.url} onDismiss={() => setShowImage(null)}>
                    <Image
                        style={styles.profilePicture}
                        source={showImage?.url}
                        placeholder={{ blurhash: showImage?.bluredHash }}
                    />
                </Dialog>
            </Portal>
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    profilePicture: {
        width: "100%",
        aspectRatio: 1,
    }
});