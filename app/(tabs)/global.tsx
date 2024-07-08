import { feedRefresh, getGlobalFeed } from "@/api/feed.api";
import { PostDataWithWriterDto } from "@/api/models";
import PostGridViewer from "@/components/Posts/PostGridViewer";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { Portal, Surface } from "react-native-paper";

export default function Global() {
    const idListRef = useRef<any>({})
    const [posts, setPosts] = useState<PostDataWithWriterDto[]>([]);
    const [refreshing, setRefreshing] = useState(false)
    const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: [`feed:global`],
        queryFn: ({ pageParam = 1 }) => getGlobalFeed(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
    })
    const queryClient = useQueryClient()
    const navigation = useNavigation()

    useEffect(() => {
        //@ts-ignore
        navigation.addListener('tabPress', tabPress)
        return () => {
            //@ts-ignore
            navigation.removeListener('tabPress', tabPress)
        }
    }, [navigation])

    function tabPress(ev: any) {
        if (!navigation.isFocused()) {
            return
        }
        ev.preventDefault()
        refresh()
    }

    function refresh() {
        setRefreshing(true)
        feedRefresh().then(() => {
            queryClient.resetQueries({
                queryKey: [`feed:global`],
                exact: true
            })
        }).finally(() => {
            setRefreshing(false)
        })
    }

    useEffect(() => {
        if (data) {
            const newPosts: PostDataWithWriterDto[] = []
            idListRef.current = {}
            data.pages.forEach(page => {
                page.data.forEach(post => {
                    if (!idListRef.current[post.id]) {
                        idListRef.current[post.id] = true
                        newPosts.push(post)
                    }
                })
            })
            setPosts(newPosts)

            if (newPosts.length === 0) {
                feedRefresh().then(() => {
                    queryClient.resetQueries({
                        queryKey: [`feed:global`],
                        exact: true
                    })
                })
            }
        }
    }, [data])

    return (
        <Surface style={{ width: "100%", flex: 1 }}>
            <Portal.Host >
                <PostGridViewer posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} refreshing={refreshing} onRefresh={refresh} />
            </Portal.Host>
        </Surface>
    );
}