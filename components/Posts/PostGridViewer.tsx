import { PostDataWithWriterDto } from "@/api/models";
import { BackHandler, Dimensions, FlatList, StyleSheet, View } from 'react-native';
import PostGrid from "./PostGrid";
import { IconButton, Portal, Surface, Text } from "react-native-paper";
import PostFullViewer from "./PostFullViewer";
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";

export interface PostGridViewerProps {
    posts: PostDataWithWriterDto[];
    hasNextPage: boolean;
    fetchNextPage: () => void;
}

export default function PostGridViewer({ posts, hasNextPage, fetchNextPage }: PostGridViewerProps) {
    const translateX = useSharedValue(Dimensions.get('window').width);
    const [focusPostIndex, setFocusPostIndex] = useState<number | undefined>(undefined)
    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }]
        }
    })

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
        }
    })

    function handleBackPress() {
        if (focusPostIndex !== undefined) {
            handleClose()
            return true
        }
        return false
    }

    function clickToGridPost(index: number) {
        setFocusPostIndex(index)
        translateX.value = withSpring(0, {
            mass: 1,
            damping: 43,
            stiffness: 319,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        });
    }

    function handleClose() {
        translateX.value = withSpring(Dimensions.get('window').width, {
            mass: 1,
            damping: 43,
            stiffness: 319,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        });
        setFocusPostIndex(undefined)
    }

    return (
        <>
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => <PostGrid {...item} onPress={() => { clickToGridPost(index) }} />}
                numColumns={3}
                style={styles.gridList}
                columnWrapperStyle={{ justifyContent: 'flex-start', gap: 1 }}
                ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
                onEndReached={(thresh) => hasNextPage && fetchNextPage()}
            />
            <Portal>
                <Animated.View style={[styles.fullListContainer, animatedStyles]}>
                    <Surface style={styles.fullListContainer}>
                        <View style={styles.header}>
                            <IconButton style={styles.backButton} icon="chevron-left" onPress={handleClose} size={35} />
                        </View>
                        <PostFullViewer posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} focusPostIndex={focusPostIndex} />
                    </Surface>
                </Animated.View>
            </Portal>
        </>
    )
}

const styles = StyleSheet.create({
    gridList: {
        width: '100%',
    },
    fullListContainer: {
        width: '100%',
        flex: 1,
    },
    header: {
        height: 38
    },
    backButton: {
        position: "absolute",
        left: -10,
        top: -8
    }
});