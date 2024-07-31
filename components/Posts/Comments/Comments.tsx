import { CommentDataWithLikedDto } from "@/api/models";
import { createComment, deleteComment, getComments } from "@/api/post.api";
import { i18n } from "@/locales/locales";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { useTheme, Text, Divider, TextInput, IconButton } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Comment from "./components/Comment";

interface CommentsProps {
    selectedPostId: string | undefined;
    handleClose: () => void;
}

export default function Comments({ selectedPostId, handleClose }: CommentsProps) {
    const id = useMemo(() => Math.floor(Math.random()*1000000), [])
    const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: [`post:comments:${id}`],
        queryFn: ({ pageParam = 1 }) => getComments(selectedPostId + "", pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
        enabled: !!selectedPostId
    })
    const queryClient = useQueryClient()
    const [comments, setComments] = useState<CommentDataWithLikedDto[]>([])
    const commentIdListRef = useRef<any>({})
    const [comment, setComment] = useState<string>("")
    const [commentSending, setCommentSending] = useState(false)

    const height = useSharedValue(0);
    const animatedStyles = useAnimatedStyle(() => {
        return {
            height: height.value
        }
    })
    const theme = useTheme()

    useEffect(() => {
        if (selectedPostId) {
            queryClient.resetQueries({
                queryKey: [`post:comments:${id}`],
                exact: true
            })
            height.value = withSpring(Dimensions.get('window').height * 0.5, {
                damping: 43
            })
        } else {
            height.value = withSpring(0, {
                damping: 43
            })
        }
    }, [selectedPostId])

    useEffect(() => {
        if (!selectedPostId) {
            let tmr = setTimeout(() => {
                setComments([])
                commentIdListRef.current = {}
                setComment("")
                queryClient.resetQueries({
                    queryKey: [`post:comments:${id}`],
                    exact: true
                })
            }, 500)
            return ()=>{
                if(tmr){
                    clearTimeout(tmr)
                }
            }
        }

        if (!data) {
            return
        }

        const newComments: CommentDataWithLikedDto[] = []
        commentIdListRef.current = {}
        data.pages.forEach(page => {
            page.data.forEach(comment => {
                if (!commentIdListRef.current[comment.id]) {
                    commentIdListRef.current[comment.id] = true
                    newComments.push(comment)
                }
            })
        })
        setComments(newComments)
    }, [data, selectedPostId])

    function sendComment() {
        if (!selectedPostId) {
            return
        }

        setCommentSending(true)

        createComment(selectedPostId, comment).then((comment) => {
            setComment("")
            commentIdListRef.current[comment.id] = true
            setComments((prev) => {
                prev.unshift(comment)
                return prev
            })
        }).catch((e) => {
            console.error(e)
        }).finally(() => {
            setCommentSending(false)
        })
    }

    function close() {
        if (height.value < Dimensions.get('window').height * 0.4) {
            return
        }
        handleClose()
    }

    function _deleteComment(id: string) {

        let index = comments.findIndex((comment) => comment.id === id)

        setComments((prev) => {
            prev.splice(index, 1)
            return [...prev]
        })

        deleteComment(id).catch(() => {
            if (!selectedPostId){
                return;
            }
            setComments((prev) => {
                prev.splice(index, 0, comments[index])
                return [...prev]
            })
        })
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ ...styles.container }}>
            <TouchableWithoutFeedback onPress={close}>
                <View style={{
                    height: selectedPostId ? Dimensions.get('window').height : 0,
                    width: "100%"
                }} />
            </TouchableWithoutFeedback>
            <Animated.View style={[styles.commentContainer, animatedStyles, {
                backgroundColor: theme.colors.surface,
                overflow: "hidden",
            }]}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        {i18n.t("post.comments")}
                    </Text>
                </View>
                <Divider />
                <FlatList
                    data={comments}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <Comment deleteComment={_deleteComment} {...item} />}
                    style={styles.commentContainer}
                    ItemSeparatorComponent={() => <Divider style={{ marginTop: 10 }} />}
                    onEndReached={(thresh) => hasNextPage && fetchNextPage()}
                />
                <View style={styles.sendContainter}>
                    <TextInput
                        style={styles.textInput}
                        placeholder={i18n.t("post.writeComment")}
                        value={comment}
                        onChangeText={setComment}
                        disabled={commentSending}
                        maxLength={250}
                    />
                    <IconButton icon="send" onPress={sendComment} loading={commentSending} disabled={commentSending} />
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    commentContainer: {
        width: "100%"
    },
    titleContainer: {
        alignItems: "center",
        padding: 4
    },
    titleText: {
        fontSize: 18,
        fontWeight: "700"
    },
    sendContainter: {
        flexDirection: "row",
        alignItems: "center",
    },
    textInput: {
        flex: 1
    }
})