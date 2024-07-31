import { CommentDataWithLikedDto } from "@/api/models";
import { getTranslation } from "@/locales/getTranslation";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Button, Dialog, Divider, IconButton, Portal, Text, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { i18n } from "@/locales/locales";
import { likeComment, unlikeComment } from "@/api/post.api";
import moment from "moment";
import VisitUser from "@/components/VisitUser";
import { readableNumber } from "@/helpers/readableNumber";
import { useSelector } from "react-redux";
import { selectProfile } from "@/slices/userSlice";

const firstShowLength = 140

interface CommentProps extends CommentDataWithLikedDto {
    deleteComment: (id: string) => void
}

export default function Comment({
    content,
    writer,
    liked: likedProp,
    id,
    likes,
    createdAt,
    deleteComment
}: CommentProps) {
    const [liked, setLiked] = useState(likedProp)
    const [showMore, setShowMore] = useState(false)
    const theme = useTheme()
    const text = useMemo(() => {
        return getTranslation(content)
    }, [content])
    const user = useSelector(selectProfile)
    const [showMenu, setShowMenu] = useState(false)

    useEffect(() => {
        if (text.length > 100) {
            setShowMore(true)
        }
    }, [])

    function toggleLike() {
        if (liked) {
            unlikeComment(id).catch((e) => { })
        } else {
            likeComment(id).catch((e) => { })
        }

        setLiked(!liked)
    }

    function onLongPress() {
        if (user?.id !== writer.id || showMenu) {
            return;
        }
        setShowMenu(true)
    }

    function handleCancel() {
        setShowMenu(false)
    }

    function handleDelete() {
        deleteComment(id)
    }

    let likeCount = likes

    if (liked && !likedProp) {
        likeCount += 1
    } else if (!liked && likedProp) {
        likeCount -= 1
    }

    const comp = (
        <TouchableWithoutFeedback onLongPress={onLongPress} delayLongPress={750}>
            <View style={styles.container}>
                <View style={styles.writerPP}>
                    <VisitUser {...writer}>
                        <Image
                            source={writer.profilePicture ? writer.profilePicture : require("@/assets/images/noProfilePicture.png")}
                            placeholder={{ blurhash: writer.profilePictureBlurhash }}
                            style={{ ...styles.writerPP, borderRadius: 20 }}
                        />
                    </VisitUser>
                </View>


                <View style={{ flex: 1 }}>
                    <Text>
                        <VisitUser {...writer}>
                            <Text style={styles.writerUsername}>{writer.username + "  "}</Text>
                        </VisitUser>
                        <Text style={{
                            color: theme.colors.primary,
                            fontWeight: "thin",
                            fontSize: 12
                        }}> {moment(createdAt).fromNow()} </Text>
                    </Text>
                    <Text>
                        {
                            !showMore ? text : text.slice(0, firstShowLength)
                        }
                        {
                            showMore &&
                            <Text onPress={() => setShowMore(false)} style={{ color: theme.colors.primary }}>
                                {' ' + i18n.t("showMore")}
                            </Text>
                        }
                    </Text>

                </View>
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <IconButton
                        icon={liked ? "heart" : "heart-outline"}
                        iconColor={liked ? theme.colors.primary : theme.colors.onSurface}
                        onPress={toggleLike}
                    />
                    <Text>{readableNumber(likeCount)}</Text>
                </View>

            </View>
        </TouchableWithoutFeedback>
    )

    if (!showMenu) {
        return comp
    } else {
        return (
            <>
                {comp}
                <Portal>
                    <Dialog visible={true} onDismiss={handleCancel} style={styles.menuDialog}>
                        {comp}
                        <Divider />
                        <View style={styles.menuButtonGroup}>
                            <Button icon={"delete"} onPress={handleDelete}>
                                {i18n.t("delete")}
                            </Button>
                            <Button icon={"cancel"} mode="contained" onPress={handleCancel}>
                                {i18n.t("cancel")}
                            </Button>
                        </View>
                    </Dialog>
                </Portal>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 10,
        padding: 5
    },
    writerPP: {
        width: 40,
        height: 40,
    },
    writerUsername: {
        fontWeight: "700",
        fontSize: 16,
    },
    menuButtonGroup: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 5
    },
    menuDialog: {
        padding: 5,
    }
})