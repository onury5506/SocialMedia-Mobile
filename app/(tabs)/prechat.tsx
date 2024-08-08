import { IconButton, Surface, Text, TextInput } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import VisitUser from "@/components/VisitUser";
import { Image } from "expo-image";
import { createPrivateRoom, getPrivateRoomWithUser, newMessageForRoom, sendMessageQueueAdd } from "@/api/chat.api";
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { ChatMessageDtoMessageTypeEnum, ChatMessageSendDtoTypeEnum } from "@/api/models";
import { useQueryClient } from "@tanstack/react-query";
import { i18n } from "@/locales/locales";

interface PrechatParams {
    prechatUserId: string,
    prechatUserName: string,
    prechatName: string,
    prechatUserPicture?: string,
    prechatUserPictureBlurhash?: string,
}

export default function Prechat() {
    const params = useGlobalSearchParams() as any as PrechatParams
    const [focused, setFocused] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()

    useFocusEffect(useCallback(() => {
        setFocused(true)
        return () => {
            setFocused(false)
            setMessage("")
            setLoading(false)
        }
    }, []))

    useEffect(() => {

        if(!focused) {
            return
        }
        setLoading(true)
        getPrivateRoomWithUser(params.prechatUserId).then(room => {
            if(!room) {
                return
            }

            if(router.canGoBack()){
                router.back()
            }
            
            router.navigate(`/chat?chatRoomId=${room._id}&roomType=${room.roomType}&roomName=${encodeURIComponent(params?.prechatUserName || "")}&roomImagePath=${encodeURIComponent(params?.prechatUserPicture || "")}&roomImageBlurHash=${encodeURIComponent(params?.prechatUserPictureBlurhash || "")}&targetUserId=${params?.prechatUserId}&targetUserName=${encodeURIComponent(params.prechatName || "")}`)

        }).catch(err => {

        }).finally(() => {
            setLoading(false)
        })

    }, [focused])

    function sendMessage() {
        setLoading(true)

        createPrivateRoom(params.prechatUserId).then(room => {
            const messageId = sendMessageQueueAdd({
                roomId: room._id,
                type: ChatMessageSendDtoTypeEnum.Text,
                content: message
            })

            function whenMessageSent(sent: boolean, err?: string) {

                if(!sent) {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        textBody: i18n.t(err || ""),
                        autoClose: true,
                    })
                    return
                }

                queryClient.cancelQueries({
                    queryKey: [`chat:message:last:${room._id}`],
                    exact: true
                })
                queryClient.resetQueries({
                    queryKey: [`chat:message:last:${room._id}`],
                    exact: true
                })

                if(router.canGoBack()){
                    router.back()
                }

                router.navigate(`/chat?chatRoomId=${room._id}&roomType=${room.roomType}&roomName=${encodeURIComponent(params?.prechatUserName || "")}&roomImagePath=${encodeURIComponent(params?.prechatUserPicture || "")}&roomImageBlurHash=${encodeURIComponent(params?.prechatUserPictureBlurhash || "")}&targetUserId=${params?.prechatUserId}&targetUserName=${encodeURIComponent(params.prechatName || "")}`)
            }

            newMessageForRoom.once(messageId, whenMessageSent)

        }).catch(err => {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: i18n.t(err),
                autoClose: true,
            })
        })

    }

    return (
        <Surface style={styles.container}>
            <Surface style={styles.chatHeader} >
                {router.canGoBack() && <IconButton style={styles.backButton} icon="chevron-left" onPress={router.back} size={35} />}

                <VisitUser id={params.prechatUserId} name={params.prechatName} username={params.prechatUserName} >
                    <Image
                        style={styles.chatPicture}
                        source={params?.prechatUserPicture ? { uri: params?.prechatUserPicture } : require("@/assets/images/noProfilePicture.png")}
                        placeholder={{ blurhash: params?.prechatUserPictureBlurhash }}
                    />
                </VisitUser>
                <VisitUser id={params.prechatUserId} name={params.prechatName} username={params.prechatUserName!}  >
                    <Text style={styles.chatName}>{params.prechatUserName}</Text>
                </VisitUser>
            </Surface>
            <View style={{ flex: 1 }}></View>
            <View style={styles.inputArea}>
                <TextInput
                    multiline
                    right={
                        <TextInput.Icon icon="send" onPress={sendMessage} disabled={loading} loading={loading} />
                    }
                    maxLength={490}
                    disabled={loading}
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
    container: {
        flex: 1
    },
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
})