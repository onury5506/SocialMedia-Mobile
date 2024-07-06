import { FlatList, View } from "react-native";
import { ActivityIndicator, Divider, IconButton, Modal, Portal, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getFollowers, me } from "@/api/user.api";
import MiniProfile from "@/components/MiniProfile";
import { MiniUserProfile } from "@/api/models";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { i18n } from "@/locales/locales";

export interface FollowersProps {
    userId: string;
    visible: boolean;
    onClose: () => void;
}

export default function Followers({
    userId,
    visible,
    onClose
}: FollowersProps) {
    const idListRef = useRef<any>({})
    const [followers, setFollowers] = useState<MiniUserProfile[]>([])
    const infQuery = useInfiniteQuery({
        queryKey: [`followers:${userId}`],
        queryFn: ({ pageParam = 1 }) => getFollowers(userId, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
    })
    const queryClient = useQueryClient()

    function reset() {
        queryClient.cancelQueries({
            queryKey: [`followings:${userId}`],
            exact: true
        })
        queryClient.resetQueries({
            queryKey: [`followings:${userId}`],
            exact: true
        })
        queryClient.cancelQueries({
            queryKey: [`followers:${userId}`],
            exact: true
        })
        queryClient.resetQueries({
            queryKey: [`followers:${userId}`],
            exact: true
        })
        idListRef.current = {}
        setFollowers([])
    }

    useEffect(() => {
        if (visible) {
            return reset
        }
    }, [visible])

    useEffect(() => {
        const newFollowers: MiniUserProfile[] = []
        idListRef.current = {}

        infQuery.data?.pages?.forEach(page => {
            page.data.forEach(follower => {
                if (!idListRef.current[follower.id]) {
                    idListRef.current[follower.id] = true
                    newFollowers.push(follower)
                }
            })
        })

        setFollowers(newFollowers)
    }, [infQuery.data])

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose}>
                <View style={styles.container}>
                    <Surface style={styles.innerContainer}>
                        <View style={styles.titleBar}>
                            <Text style={styles.title}>{i18n.t("profile.followers")}</Text>
                            <IconButton style={styles.closeButton} icon="close" onPress={onClose} />
                        </View>
                        <Divider style={{ width: "100%" }} />
                        <FlatList
                            data={followers}
                            renderItem={({ item }) => <MiniProfile key={item.id} {...item} />}
                            keyExtractor={(item) => item.id}
                            style={{ width: "100%" }}
                            onEndReached={(distance) => {
                                infQuery.fetchNextPage()
                            }}
                        />
                        {
                            (infQuery.isLoading || infQuery.isFetchingNextPage) && <ActivityIndicator size="large" animating={true} />
                        }
                    </Surface>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%", justifyContent: "center", alignItems: "center",
        height: "80%"
    },
    innerContainer: {
        width: "85%",
        height: "100%",
        borderRadius: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    titleBar: {
        width: "100%",
        alignItems: "center",
        padding: 3
    },
    closeButton: {
        position: "absolute",
        right: 10,
        top: -7
    }
})