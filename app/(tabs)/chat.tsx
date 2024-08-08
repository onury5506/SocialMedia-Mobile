import { getMessages, sendMessageQueueAdd } from "@/api/chat.api";
import { ChatMessageDto, ChatMessageSendDtoTypeEnum, ChatRoomDtoRoomTypeEnum } from "@/api/models";
import Message from "@/components/Chat/Message/message";
import { selectProfile } from "@/slices/userSlice";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { IconButton, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import { useAppTheme } from "../_layout";
import { Image } from "expo-image";
import VisitUser from "@/components/VisitUser";

interface ChatParams {
    chatRoomId: string
    roomName: string
    roomType: ChatRoomDtoRoomTypeEnum
    roomImagePath: string
    roomImageBlurHash: string
    targetUserId?: string
    targetUserName?: string
}

function reducer(state: ChatMessageDto[], action: { type: "addToHeed" | "addToTail" | "clean" | "update" | "set", payload: any }): ChatMessageDto[] {

    if (action.type === "clean") {
        return []
    } else if (action.type === "addToHeed") {
        state.unshift(...action.payload)
        return state
    } else if (action.type === "addToTail") {
        state.push(...action.payload)
        return state
    } else if (action.type === "update") {
        const index = state.findIndex(message => message === action.payload[0])
        state[index] = action.payload[1]
        return state
    } else if (action.type === "set") {
        return action.payload
    }

    return [...state]
}

export default function Chat() {
    const params = useGlobalSearchParams() as any as ChatParams
    const user = useSelector(selectProfile)
    const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: [`chatRoom:${params.chatRoomId}`],
        queryFn: ({ pageParam = 0 }) => getMessages(params.chatRoomId, pageParam, 30),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
        enabled: !!params.chatRoomId
    })
    const [focused, setFocused] = useState(false)
    const messageIds = useRef<any>({})
    const [messages, dispatchMessages] = useReducer(reducer, [])
    const [message, setMessage] = useState("")
    const listRef = useRef<FlatList<ChatMessageDto> | null>(null)
    const scrollPosRef = useRef<number>(0)
    const [thereIsNewMessaage, setThereIsNewMessaage] = useState<boolean>(false)
    const theme = useAppTheme()

    useFocusEffect(useCallback(() => {
        setFocused(true)
        return () => {
            setFocused(false)
            dispatchMessages({ type: "clean", payload: [] })
        }
    }, []))

    useEffect(() => {
        if (!focused || !params?.chatRoomId) {
            return;
        }
    }, [params, focused])

    useEffect(() => {
        if (!params?.chatRoomId || !data?.pages || !focused) {
            return
        }

        const debounced = setTimeout(() => {
            const newMessages: ChatMessageDto[] = []
            messageIds.current = {}
            data.pages.forEach(page => {
                page.data.forEach(message => {
                    if (!messageIds.current[message._id]) {
                        messageIds.current[message._id] = true
                        newMessages.push(message)
                    }
                })
            })

            if (messages.length > 0 && messages[0]?._id !== newMessages[0]?._id) {
                if (scrollPosRef.current < 300) {
                    listRef.current?.scrollToIndex({ index: 0, animated: false })
                } else {
                    setThereIsNewMessaage(true)
                }
            }

            dispatchMessages({ type: "set", payload: newMessages })
        }, 100)

        return () => {
            if (debounced) {
                clearTimeout(debounced)
            }
        }
    }, [data, params, focused])

    function onEndReached(a: any) {
        return hasNextPage && fetchNextPage()
    }

    function onStartReached() {
        setThereIsNewMessaage(false)
    }

    function pressOnThereIsNewMessage() {
        listRef.current?.scrollToIndex({ index: 0, animated: true })
        setThereIsNewMessaage(false)
    }

    function sendMessage() {
        if (message.length === 0) {
            return;
        }

        setMessage("")
        sendMessageQueueAdd({
            roomId: params?.chatRoomId,
            type: ChatMessageSendDtoTypeEnum.Text,
            content: message
        })
        listRef.current?.scrollToIndex({ index: 0, animated: false })
    }

    return (
        <Surface style={{ flex: 1 }}>
            <Surface style={styles.chatHeader} >
                {router.canGoBack() && <IconButton style={styles.backButton} icon="chevron-left" onPress={router.back} size={35} />}

                {
                    params.targetUserId ? (
                        <>
                            <VisitUser id={params.targetUserId} name={params.roomName} username={params.targetUserName!} >
                                <Image
                                    style={styles.chatPicture}
                                    source={params?.roomImagePath ? { uri: params?.roomImagePath } : require("@/assets/images/noProfilePicture.png")}
                                    placeholder={{ blurhash: params?.roomImageBlurHash }}
                                />
                            </VisitUser>
                            <VisitUser id={params.targetUserId} name={params.roomName} username={params.targetUserName!} >
                                <Text style={styles.chatName}>{params.roomName}</Text>
                            </VisitUser>
                        </>

                    ) : (
                        <>
                            <Image
                                style={styles.chatPicture}
                                source={params?.roomImagePath ? { uri: params?.roomImagePath } : require("@/assets/images/noProfilePicture.png")}
                                placeholder={{ blurhash: params?.roomImageBlurHash }}
                            />
                            <Text style={styles.chatName}>{params.roomName}</Text>
                        </>
                    )
                }

            </Surface>
            <View style={{ flex: 1 }}>
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <Message {...item} isFromCurrentUser={item.sender === user?.id} roomType={params.roomType} />}
                    onEndReached={onEndReached}
                    inverted={true}
                    refreshing={isFetching}
                    onScroll={event => {
                        scrollPosRef.current = event.nativeEvent.contentOffset.y
                    }}
                    onScrollEndDrag={event => {
                        scrollPosRef.current = event.nativeEvent.contentOffset.y
                    }}
                    onEndReachedThreshold={0.3}
                    onStartReached={onStartReached}
                    onStartReachedThreshold={0.3}
                    scrollEventThrottle={50}
                />
                {
                    thereIsNewMessaage && (
                        <IconButton
                            style={[
                                styles.thereIsNewMessage,
                                {
                                    borderColor: theme.colors.primary,
                                    backgroundColor: theme.colors.primary
                                }
                            ]}
                            iconColor={theme.colors.surface}
                            icon="arrow-down"
                            onPress={pressOnThereIsNewMessage}
                        />
                    )
                }
            </View>
            <View style={styles.inputArea}>
                <TextInput
                    multiline
                    right={
                        <TextInput.Icon icon="send" onPress={sendMessage} />
                    }
                    maxLength={490}
                    style={[{
                        width: "90%",
                        alignContent: "center",
                        justifyContent: "center",
                    }, !message.includes("\n") ? { height: 50 } : { maxHeight: 90 }]} onChangeText={setMessage} value={message}
                />
            </View>
        </Surface>
    )
}

const styles = StyleSheet.create({
    chatPicture: {
        width: 30,
        height: 30,
        borderRadius: 25,
    },
    chatHeader: {
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    chatName: {
        fontSize: 16,
        fontWeight: "bold"
    },
    inputArea: {
        padding: 5,
        alignContent: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    thereIsNewMessage: {
        position: "absolute",
        bottom: 2,
        alignSelf: "center",
        borderWidth: 1,
    },
    backButton: {
        position: "absolute",
        left: -10,
        top: -8
    }
});
