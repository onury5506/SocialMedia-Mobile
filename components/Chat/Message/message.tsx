import { ChatMessageDto, ChatMessageDtoMessageStatusEnum, ChatRoomDtoRoomTypeEnum } from "@/api/models";
import { useAppTheme } from "@/app/_layout";
import { getTranslation } from "@/locales/getTranslation";
import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Icon, Text } from "react-native-paper";

interface MessageProps extends ChatMessageDto {
    isFromCurrentUser: boolean;
    roomType: ChatRoomDtoRoomTypeEnum;
}

export default function Message(props: MessageProps) {
    switch (props.roomType) {
        case ChatRoomDtoRoomTypeEnum.Private:
            return <PrivateMessage {...props} />
        case ChatRoomDtoRoomTypeEnum.Group:
            return <GroupMessage {...props} />
    }
}

function MessageStatus({status}: {status: ChatMessageDtoMessageStatusEnum}) {
    switch (status) {
        case ChatMessageDtoMessageStatusEnum.Sent:
            return null
        case ChatMessageDtoMessageStatusEnum.Pending:
            return <Icon source="clock" size={16} />
        case ChatMessageDtoMessageStatusEnum.Error:
            return <Icon source="alert-circle" color="red" size={16} />
        default:
            return null
    }
}

function PrivateMessage(props: MessageProps) {
    const theme = useAppTheme()

    const message = useMemo(() => {
        if (props.isFromCurrentUser) {
            return props.content!.originalText
        }
        return getTranslation(props.content!)
    }, [props.content])

    const messageStatus = useMemo(() => {
        return <MessageStatus status={props.messageStatus} />
    }, [props.messageStatus])

    return (
        <Text style={
            [   styles.message,
                props.isFromCurrentUser
                ? styles.fromUser
                : styles.fromOthers,
                {
                    backgroundColor: props.isFromCurrentUser ? theme.colors.chatFromUser : theme.colors.chatFromOthers,
                    color: theme.colors.chatText
                }
            ]
        }>
            {messageStatus}
            {message}
        </Text>
    )
}

function GroupMessage(props: MessageProps) {
    return (
        <View>

        </View>
    )
}

const styles = StyleSheet.create({
    message: {
        marginTop: 5,
        padding: 6,
        borderRadius: 10,
    },
    fromUser: {
        alignSelf: 'flex-end',
        minWidth: "40%",
        maxWidth: "80%",
        marginRight: 5
    },
    fromOthers: {
        minWidth: "40%",
        maxWidth: "80%",
        alignSelf: 'flex-start',
        marginLeft: 5
    }
});
