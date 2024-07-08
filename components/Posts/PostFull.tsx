import { PostDataWithWriterDto } from "@/api/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { Surface, useTheme, Text, IconButton } from "react-native-paper";
import { Image, ImageStyle } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useDispatch, useSelector } from "react-redux";
import { selectActiveVideo } from "@/slices/activeVideoSlice";
import { setVideo } from "@/slices/activeVideoSlice";
import { i18n, languageTag } from "@/locales/locales";
import { readableNumber } from "@/helpers/readableNumber";
import { likePost, unlikePost } from "@/api/post.api";
import { getTranslation } from "@/locales/getTranslation";
import VisitUser from "../VisitUser";

let timer: any = null;
const TIMEOUT = 500
const debounce = (onDouble: () => void, onSingle = () => { }) => {
    if (timer) {
        clearTimeout(timer);
        timer = null;
        onDouble();
    } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            onSingle()
        }, TIMEOUT);
    }
};

interface PostDataWithDoubleClick extends PostDataWithWriterDto {
    onDoubleTap: () => void
}

function PostImageFull({ url, ratio, blurHash, onDoubleTap }: PostDataWithDoubleClick) {
    const theme = useTheme()


    return (
        <TouchableWithoutFeedback onPress={() => debounce(onDoubleTap)}>
            <View style={{ width: "100%" }}>
                <Image
                    source={{ uri: url }}
                    style={{ width: "100%", aspectRatio: ratio, backgroundColor: theme.colors.surface }}
                    contentFit="contain"
                    placeholder={{ blurhash: blurHash }}
                />
            </View>
        </TouchableWithoutFeedback>
    )
}

function PostVideoFull({ id, url, ratio, blurHash, onDoubleTap }: PostDataWithDoubleClick) {
    const player = useRef<Video>(null)
    const theme = useTheme()
    const dispatch = useDispatch()
    const windowHeight = Dimensions.get('window').height
    const playingVideoId = useSelector(selectActiveVideo)
    const [loaded, setLoaded] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [playing, setPlaying] = useState(false)
    let style: ViewStyle = { width: "100%", aspectRatio: ratio }

    useEffect(() => {
        if (!loaded) {
            return
        }

        if (playingVideoId === id) {
            setIsMuted(false)
            setPlaying(true)
        } else {
            setPlaying(false)
            setIsMuted(false)
            player.current?.setPositionAsync(0)
        }
    }, [playingVideoId, loaded])

    useEffect(() => {
        if (playing) {
            player.current?.playAsync()
        } else {
            player.current?.pauseAsync()
        }
    }, [playing])

    useEffect(() => {
        player.current?.setIsMutedAsync(isMuted).catch(() => { })
    }, [isMuted])

    if (ratio < 1) {
        style = { height: Math.round(windowHeight * 0.8) }
    }

    function onLoad() {
        setLoaded(true)
    }

    function onLongPress() {
        if (playingVideoId !== id) {
            return dispatch(setVideo(id))
        }

        if (playing) {
            setPlaying(false)
        } else {
            setPlaying(true)
        }
    }

    function onPress() {
        if (playingVideoId !== id) {
            return dispatch(setVideo(id))
        }

        if (!playing) {
            return setPlaying(true)
        }

        setIsMuted(!isMuted)
    }

    return (
        <TouchableWithoutFeedback onLongPress={onLongPress} onPress={() => debounce(onDoubleTap, onPress)}>
            <Surface style={style}>
                <Video
                    ref={player}
                    style={{ ...styles.video, height: loaded ? undefined : 0, backgroundColor: theme.colors.surface }}
                    source={{ uri: url }}
                    isLooping={true}
                    useNativeControls={false}
                    onLoad={onLoad}
                    resizeMode={ResizeMode.CONTAIN}
                />

                {
                    !loaded && <Image
                        source={undefined}
                        style={style as ImageStyle}
                        contentFit="fill"
                        placeholder={{ blurhash: blurHash }}
                    />
                }
            </Surface>
        </TouchableWithoutFeedback>
    )
}

export interface PostFullProps extends PostDataWithWriterDto {
}

function formatPublishedDate(date: Date) {
    let _date = new Date(date)
    let today = new Date()
    let isSameYear = today.getFullYear() === _date.getFullYear()
    return _date.toLocaleDateString(languageTag, { year: isSameYear ? undefined : 'numeric', month: 'short', day: 'numeric' })
}

export default function PostFull(post: PostDataWithWriterDto) {
    const theme = useTheme()
    const [liked, setLiked] = useState(post.liked)
    const [showMore, setShowMore] = useState(false)
    const { publishedAt, postType, writer, comments } = post

    const component = useMemo(() => {
        if (postType === 'image') {
            return <PostImageFull {...post} onDoubleTap={onDoubleTap} />
        } else if (postType === 'video') {
            return <PostVideoFull {...post} onDoubleTap={onDoubleTap} />
        }
        return null
    }, [postType])

    function onDoubleTap() {
        if (liked) return
        toggleLike()
    }

    function toggleLike() {
        if (liked) {
            setLiked(false)
            unlikePost(post.id).catch()
        } else {
            setLiked(true)
            likePost(post.id).catch()
        }
    }

    let likes = post.likes

    if (liked && !post.liked) {
        likes += 1
    } else if (!liked && post.liked) {
        likes -= 1
    }

    const text = getTranslation(post.content)

    const showShowMoreButton = !showMore && text.length > 30
    const textProcessed = showMore ? text : text.slice(0, 30)

    return (
        <View style={styles.postContainer}>
            <View style={styles.writer}>
                <VisitUser {...writer}>
                    <Image
                        source={writer.profilePicture ? writer.profilePicture : require("@/assets/images/noProfilePicture.png")}
                        style={styles.writerPP}
                        contentFit="fill"
                        placeholder={{ blurhash: writer.profilePictureBlurhash }}
                    />
                </VisitUser>
                <VisitUser {...writer}>
                    <Text style={styles.writerUsername}>{writer.username}</Text>
                </VisitUser>

                <Text style={styles.publishedAt}>{formatPublishedDate(publishedAt)}</Text>
            </View>
            {component}
            <View style={styles.icons}>
                <View style={styles.iconContainer}>
                    <IconButton
                        icon={liked ? "heart" : "heart-outline"}
                        iconColor={liked ? theme.colors.primary : theme.colors.onSurface}
                        size={20}
                        onPress={toggleLike}
                    />
                    <Text style={styles.counterText}>{readableNumber(likes)}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <IconButton
                        icon={"comment-outline"}
                        iconColor={theme.colors.onSurface}
                        size={20}
                    />
                    {/*<Text style={styles.counterText}>{comments}</Text>*/}
                </View>
            </View>
            {
                text &&
                <View>
                    <Text style={styles.text}>
                        <Text style={styles.writerUsernameBeforeText}>
                            {writer.username + ' '}
                        </Text>
                        {textProcessed}
                        {
                            showShowMoreButton &&
                            <Text onPress={() => setShowMore(true)} style={{ color: theme.colors.primary }}>
                                {' ' + i18n.t("showMore")}
                            </Text>
                        }
                    </Text>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        width: "100%"
    },
    video: {
        flex: 1,
        width: "100%",
        backgroundColor: "black"
    },
    postContainer: {

    },
    writer: {
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    writerPP: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    writerUsername: {
        fontSize: 18,
    },
    writerUsernameBeforeText: {
        fontWeight: "700"
    },
    publishedAt: {
        position: "absolute",
        right: 10
    },
    icons: {
        flexDirection: "row",
        padding: 2
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    counterText: {
        marginLeft: -10,
        fontSize: 12,
        position: "relative",
        top: -5
    },
    text: {
        paddingLeft: 10,
        paddingRight: 10,
    }
})