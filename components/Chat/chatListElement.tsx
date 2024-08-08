import { getLastMessage } from "@/api/chat.api";
import { ChatMessageDto, ChatRoomDto, ChatRoomDtoRoomTypeEnum, UserProfileWithRelationDTO } from "@/api/models";
import { getProfile } from "@/api/user.api";
import { getTranslation } from "@/locales/getTranslation";
import { selectProfile } from "@/slices/userSlice";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import moment from "moment";
import { useRouter } from "expo-router";
import { getCharacterLength, subString } from "@/helpers/string";
import { useMemo } from "react";

interface ChatListElementProps extends ChatRoomDto {
    showImage: (image: {
        url: string,
        bluredHash: string
    } | null) => void
}

export function ChatListElement(props: ChatListElementProps) {
    switch (props.roomType) {
        case ChatRoomDtoRoomTypeEnum.Private:
            return <PrivateChatListElement {...props} />
        case ChatRoomDtoRoomTypeEnum.Group:
            return null;
        default:
            return null;
    }
}

function PrivateChatListElement({
    _id: id,
    roomType,
    members,
    showImage
}: ChatListElementProps) {

    const user = useSelector(selectProfile)
    const targetUserId = members.find(member => member !== user?.id)
    const theme = useTheme()
    const router = useRouter();

    const {
        data: targetUser,
        isFetching: isTargetUserFetching
    } = useQuery<UserProfileWithRelationDTO>({
        queryKey: [`user:${targetUserId}`],
        queryFn: () => {
            return getProfile(targetUserId!)
        }
    })

    const {
        data: lastMessage,
        isFetching: isLastMessageFetching
    } = useQuery<ChatMessageDto | null>({
        queryKey: [`chat:message:last:${id}`],
        queryFn: () => {
            return getLastMessage(id)
        }
    })

    const text = useMemo(() => {
        let lastMessageContent = lastMessage?.content
        let text = ""

        if (lastMessageContent) {
            if(user?.id === lastMessage?.sender) {
                text = lastMessageContent.originalText
            }else{
                text = getTranslation(lastMessageContent)
            }
        }

        if (getCharacterLength(text) > 60) {
            text = subString(text, 0, 57) + "..."
        }

        return text
    }, [lastMessage])

    function navigateToChat() {
        router.push(`/chat?chatRoomId=${id}&roomType=${roomType}&roomName=${encodeURIComponent(targetUser?.name || "")}&roomImagePath=${encodeURIComponent(targetUser?.profilePicture || "")}&roomImageBlurHash=${encodeURIComponent(targetUser?.profilePictureBlurhash || "")}&targetUserId=${targetUserId}&targetUserName=${encodeURIComponent(targetUser?.username || "")}`)
    }

    function handleProfilePicturePress() {
        if (!targetUser || !targetUser.profilePicture || !targetUser.profilePictureBlurhash) {
            return;
        }

        showImage({
            url: targetUser.profilePicture,
            bluredHash: targetUser.profilePictureBlurhash
        })
    }

    if (isTargetUserFetching || isLastMessageFetching) {
        return <ChatListElementLoading />
    }


    const now = new Date()
    const lastMessagePublishDate = new Date(lastMessage?.publishedAt || 0)
    let dateText = moment(lastMessagePublishDate).format('LT')
    if (now.getDate() !== lastMessagePublishDate.getDate()) {
        dateText = moment(lastMessagePublishDate).format('L')
    }

    return (
        <TouchableOpacity onPress={navigateToChat}>
            <Surface style={styles.container}>
                <TouchableOpacity onPress={handleProfilePicturePress}>
                    <Image
                        style={styles.profilePicture}
                        source={targetUser?.profilePicture ? { uri: targetUser.profilePicture } : require("@/assets/images/noProfilePicture.png")}
                        placeholder={{ blurhash: targetUser?.profilePictureBlurhash }}
                    />
                </TouchableOpacity>
                <View style={styles.textContainer}>
                    <Text style={styles.name} >{targetUser?.name}</Text>
                    <Text>{text ?? ""}</Text>
                    <Text style={{ ...styles.date, color: theme.colors.primary }}>{dateText}</Text>
                </View>
            </Surface>
        </TouchableOpacity>
    )
}

function ChatListElementLoading() {
    return null
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 10,
        gap: 5,
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
    },
    profilePicture: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        overflow: "hidden",
        borderRadius: 50,
    },
    date: {
        position: "absolute",
        right: 10,
    },
    name: {
        fontWeight: "bold",
    }
});