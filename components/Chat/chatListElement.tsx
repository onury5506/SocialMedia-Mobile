import { getLastMessage } from "@/api/chat.api";
import { ChatMessageDto, ChatRoomDto, ChatRoomDtoRoomTypeEnum, UserProfileWithRelationDTO } from "@/api/models";
import { getProfile } from "@/api/user.api";
import { getTranslation } from "@/locales/getTranslation";
import { selectProfile } from "@/slices/userSlice";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { View, StyleSheet } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import moment from "moment";

interface ChatListElementProps extends ChatRoomDto {
    lastMessage?: ChatMessageDto
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
    lastMessage: newestLastMessage
}: ChatListElementProps) {

    const user = useSelector(selectProfile)
    const targetUserId = members.find(member => member !== user?.id)
    const theme = useTheme()

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

    if (isTargetUserFetching || isLastMessageFetching) {
        return <ChatListElementLoading />
    }

    let lastMessageContent = newestLastMessage?.content || lastMessage?.content
    let text = lastMessageContent ? getTranslation(lastMessageContent) : ""

    if (text.length > 30) {
        text = text.slice(0, 27) + "..."
    }

    const now = new Date()
    const lastMessagePublishDate = new Date(newestLastMessage?.publishedAt || lastMessage?.publishedAt || 0)
    let dateText = moment(lastMessagePublishDate).format('LT')
    if (now.getDate() !== lastMessagePublishDate.getDate()) {
        dateText = moment(lastMessagePublishDate).format('L')
    }

    return (
        <Surface style={styles.container}>
            <Image
                style={styles.profilePicture}
                source={targetUser?.profilePicture ? { uri: targetUser.profilePicture } : require("@/assets/images/noProfilePicture.png")}
                placeholder={{ blurhash: targetUser?.profilePictureBlurhash }}
            />
            <View style={styles.textContainer}>
                <Text style={styles.name} >{targetUser?.name}</Text>
                <Text>{lastMessageContent ? getTranslation(lastMessageContent) : ""}</Text>
                <Text style={{...styles.date, color:theme.colors.primary}}>{dateText}</Text>
            </View>
        </Surface>
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