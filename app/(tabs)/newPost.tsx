import { Button, IconButton, Surface, Text, TextInput } from "react-native-paper";
import { StyleSheet, View, Image, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { i18n } from "@/locales/locales";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { CreatePostRequestDtoPostMimeTypeEnum, PostDataDtoPostStatusEnum, PostDataDtoPostTypeEnum } from "@/api/models";
import { Video, ResizeMode } from 'expo-av';
import { createPost, getPostStatus, uploadFileWithSignedUrl } from "@/api/post.api";
import { useSelector } from "react-redux";
import { selectProfile } from "@/slices/userSlice";
import { useQueryClient } from "@tanstack/react-query";
import { useRoute } from "@react-navigation/native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

export default function NewPost() {
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState("")
    const [videoPlaying, setVideoPlaying] = useState(false)
    const player = useRef<Video>(null)
    const [file, setFile] = useState({
        uri: undefined as string | undefined,
        size: 0,
        mimeType: CreatePostRequestDtoPostMimeTypeEnum.Imagejpeg,
        postType: PostDataDtoPostTypeEnum.Video
    })
    const user = useSelector(selectProfile)
    const queryClient = useQueryClient()
    const route = useRoute()
    const loadingRef = useRef({ loading: false })

    useFocusEffect(useCallback(() => {
        return reset
    }, []))

    useEffect(() => {
        loadingRef.current.loading = loading
    }, [loading])

    useEffect(() => {
        if (file.uri && file.postType === PostDataDtoPostTypeEnum.Video) {
            player.current?.playAsync()
            player.current?.setIsLoopingAsync(true)
            setVideoPlaying(true)
        } else {
            player.current?.unloadAsync()
            player.current?.pauseAsync()
            player.current?.setPositionAsync(0)
            setVideoPlaying(false)
        }
    }, [file])

    useEffect(() => {
        if (videoPlaying) {
            player.current?.playAsync()
        } else {
            player.current?.pauseAsync()
        }
    }, [videoPlaying])

    function reset() {
        setVideoPlaying(false)

        if (loadingRef.current.loading) return;

        setContent("")
        player.current?.unloadAsync()
        player.current?.setPositionAsync(0)

        setFile({
            uri: undefined,
            size: 0,
            mimeType: CreatePostRequestDtoPostMimeTypeEnum.Imagejpeg,
            postType: PostDataDtoPostTypeEnum.Video
        })
    }

    async function pickImage() {
        setLoading(true)
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: false,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled || result.assets.length === 0 || !result.assets[0]) {
            setLoading(false)
            return;
        }

        const uri = result.assets[0].uri!;
        const mimeType = result.assets[0].mimeType! as CreatePostRequestDtoPostMimeTypeEnum;
        const fileSize = result.assets[0].fileSize!;
        const postType = mimeType.includes("image") ? PostDataDtoPostTypeEnum.Image : PostDataDtoPostTypeEnum.Video
        const mimeTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"]

        if (!mimeTypes.includes(mimeType)) {
            setLoading(false)
            return;
        }

        setFile({
            uri,
            size: fileSize,
            mimeType,
            postType
        })
        setLoading(false)
    }


    function togglePauseVideo() {
        setVideoPlaying(!videoPlaying)
    }

    async function sharePost() {
        if (!file.uri || loading) return;
        let interval: any = null;
        try {
            setLoading(true)
            const post = await createPost({
                postMimeType: file.mimeType,
                size: file.size,
                content: content
            })

            await uploadFileWithSignedUrl(post.signedUrl, file.uri, file.mimeType, file.size)

            interval = setInterval(async () => {
                const status = await getPostStatus(post.id)

                if (status === PostDataDtoPostStatusEnum.Inprogress) {
                    return
                } else if (status === PostDataDtoPostStatusEnum.Failed) {
                    clearInterval(interval)
                    setLoading(false)
                    reset()
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        textBody: i18n.t("error.newPost.someThingWentWrongWhileProcessing"),
                        autoClose: true,
                    })
                    return
                } else if (status === PostDataDtoPostStatusEnum.Published) {
                    clearInterval(interval)
                    queryClient.resetQueries({
                        queryKey: [`posts:${user?.id}`],
                        exact: true
                    })
                    setLoading(false)
                    reset()
                    if (route.name === "newPost") {
                        router.navigate("/profile")
                    }
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        textBody: i18n.t("newPost.postShared"),
                        autoClose: true,
                    })
                    return
                }
            }, 1000)
        } catch (err) {
            if (interval) clearInterval(interval)
            setLoading(false)
            reset()
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: i18n.t("error.newPost.someThingWentWrongWhileUploading"),
                autoClose: true,
            })
        }
    }

    return (
        <Surface style={styles.container}>
            <View style={styles.header}>
                {router.canGoBack() && <IconButton style={styles.backButton} icon="chevron-left" onPress={router.back} size={35} />}
                <Text style={styles.title}>{i18n.t("newPost.newPost")}</Text>
            </View>
            <View style={styles.content}>
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={togglePauseVideo} delayLongPress={800} >
                    <View style={styles.imageContainer}>
                        {
                            file.uri && file.postType === PostDataDtoPostTypeEnum.Image && <Image
                                source={{ uri: file.uri }}
                                style={{ height: "100%", aspectRatio: 1, backgroundColor: "black" }}
                                resizeMode="cover"
                            />
                        }
                        <Video
                            ref={player}
                            style={{ height: file.uri && file.postType === PostDataDtoPostTypeEnum.Video ? "100%" : 0, aspectRatio: 1, backgroundColor: "black" }}
                            source={{ uri: file.uri || "" }}
                            isLooping={true}
                            useNativeControls={false}
                            resizeMode={ResizeMode.CONTAIN}
                        />
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.buttonContainer}>
                    <Button icon="image-search" mode="contained" onPress={pickImage}
                        loading={loading} disabled={loading}
                    >
                        {i18n.t("newPost.PickAnImage")}
                    </Button>
                    {
                        file.uri && <Button icon="share-variant" mode="contained" onPress={sharePost}
                            loading={loading} disabled={loading}
                        >
                            {i18n.t("newPost.share")}
                        </Button>
                    }
                </View>

                <View style={{ height: "30%", width: "100%", alignItems: "center" }}>
                    <TextInput
                        label={i18n.t("newPost.writeSomething")}
                        mode="outlined"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        style={{ width: "90%", flex: 1, marginTop: 10 }}
                        disabled={loading}
                    />
                </View>
            </View>
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        width: "100%",
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        paddingTop: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    backButton: {
        position: "absolute",
        left: -10,
        top: -8
    },
    imageContainer: {
        height: "50%",
        width: "100%",
        alignItems: "center",
        marginBottom: 10
    },
    buttonContainer: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    }
});