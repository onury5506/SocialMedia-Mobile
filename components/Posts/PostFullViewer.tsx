import { PostDataWithWriterDto, PostDataWithWriterDtoPostTypeEnum } from "@/api/models";
import { FlatList, StyleSheet, View, Image, ViewToken } from 'react-native';
import PostFull from "./PostFull";
import { Divider, Surface } from "react-native-paper";
import { setVideo } from "@/slices/activeVideoSlice";
import { useDispatch } from "react-redux";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

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

    useFocusEffect(useCallback(() => {
        return () => {
            dispatch(setVideo(undefined))
        }
    }, []))

    useEffect(() => {
        if (focusPostIndex !== undefined) {
            listRef.current?.scrollToIndex({ index: focusPostIndex, animated: false })
        }
    }, [focusPostIndex])

    useEffect(() => {
        if (refreshing) {
            listRef.current?.scrollToIndex({ index: 0, animated: true })
        }
    }, [refreshing])

    function onViewableItemsChanged({ viewableItems, changed }: {
        viewableItems: ViewToken<PostDataWithWriterDto>[];
        changed: ViewToken<PostDataWithWriterDto>[];
    }) {
        const firstVideo = viewableItems.find(item => item.item.postType === PostDataWithWriterDtoPostTypeEnum.Video)
        dispatch(setVideo(firstVideo?.item?.id))
    }

    return (
        <Surface style={styles.container}>
            <FlatList
                ref={listRef}
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PostFull {...item} />}
                style={styles.fullList}
                ItemSeparatorComponent={() => <Divider style={{marginTop:10}} />}
                onEndReached={(thresh) => hasNextPage && fetchNextPage()}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 80
                }}
                onViewableItemsChanged={onViewableItemsChanged}
                onScrollToIndexFailed={console.log}
                onRefresh={onRefresh}
                refreshing={!!refreshing}
            />
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