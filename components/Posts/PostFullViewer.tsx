import { PostDataWithWriterDto, PostDataWithWriterDtoPostTypeEnum } from "@/api/models";
import { FlatList, StyleSheet, View, Image, ViewToken, BackHandler } from 'react-native';
import PostFull from "./PostFull";
import { Divider, Portal, Surface, Text } from "react-native-paper";
import { setVideo } from "@/slices/activeVideoSlice";
import { useDispatch } from "react-redux";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import Comments from "./Comments/Comments";

export interface PostFullViewerProps {
    posts: PostDataWithWriterDto[];
    hasNextPage: boolean;
    focusPostIndex?: number;
    fetchNextPage: () => void;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export default function PostFullViewer({ posts, hasNextPage, fetchNextPage, focusPostIndex, onRefresh, refreshing }: PostFullViewerProps) {
    const dispatch = useDispatch()
    const listRef = useRef<FlatList<PostDataWithWriterDto>>(null)
    const [selectedCommentsOfPost, setSelectedCommentsOfPost] = useState<string | undefined>(undefined)
    const focusedRef = useRef(false)

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleCloseComments);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleCloseComments);
        }
    })

    useFocusEffect(useCallback(() => {
        focusedRef.current = true
        return () => {
            focusedRef.current = false
            dispatch(setVideo(undefined))
        }
    }, []))

    useEffect(() => {
        if (focusPostIndex !== undefined) {
            listRef.current?.scrollToIndex({ index: focusPostIndex, animated: false })
        }
    }, [focusPostIndex])

    useEffect(() => {
        if (refreshing && posts.length > 0) {
            listRef.current?.scrollToIndex({ index: 0, animated: true })
        }
    }, [refreshing])

    function onScrollToIndexFailed(e: any) {
        const offset = e.averageItemLength * e.index
        listRef.current?.scrollToOffset({ offset, animated: true })
        setTimeout(() => {
            listRef.current?.scrollToIndex({ index: e.index, animated: true })
        }, 100)
    }

    function onViewableItemsChanged({ viewableItems, changed }: {
        viewableItems: ViewToken<PostDataWithWriterDto>[];
        changed: ViewToken<PostDataWithWriterDto>[];
    }) {
        const firstVideo = viewableItems.find(item => item.item.postType === PostDataWithWriterDtoPostTypeEnum.Video)
        dispatch(setVideo(firstVideo?.item?.id))
    }

    function onClickPostCommentButton(postId: string) {
        setSelectedCommentsOfPost(postId)
    }

    function handleCloseComments() {
        if (!selectedCommentsOfPost || !focusedRef.current) return false
        setSelectedCommentsOfPost(undefined)
        return true
    }

    return (
        <Surface style={styles.container}>
            <FlatList
                ref={listRef}
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PostFull {...item} onClickComments={onClickPostCommentButton} />}
                style={styles.fullList}
                ItemSeparatorComponent={() => <Divider style={{ marginTop: 10 }} />}
                onEndReached={(thresh) => hasNextPage && fetchNextPage()}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 80
                }}
                onViewableItemsChanged={onViewableItemsChanged}
                onScrollToIndexFailed={onScrollToIndexFailed}
                initialScrollIndex={focusPostIndex}
                onRefresh={onRefresh}
                refreshing={!!refreshing}
            />
            <Comments selectedPostId={selectedCommentsOfPost} handleClose={()=>setSelectedCommentsOfPost(undefined)}/>
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    fullList: {
        width: '100%',
        flex: 1,
    }
});