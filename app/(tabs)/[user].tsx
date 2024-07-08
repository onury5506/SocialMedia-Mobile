import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { Surface, Text, Portal, ActivityIndicator } from "react-native-paper"
import { StyleSheet, View } from 'react-native';
import { VisitUserProps } from "@/components/VisitUser";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostDataWithWriterDto, UserProfileWithRelationDTO } from "@/api/models";
import { getProfile } from "@/api/user.api";
import LoadingProfileHeader from "@/components/ProfileHeader/LoadingProfileHeader";
import ProfileHeader from "@/components/ProfileHeader/ProfileHeader";
import EventEmitter from "events";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getPostsOfUser } from "@/api/post.api";
import PostGridViewer from "@/components/Posts/PostGridViewer";
import { set } from "react-hook-form";

export const profilePageEvenEmitter = new EventEmitter();

export default function UserProfile() {
    const params = useLocalSearchParams() as any as VisitUserProps
    const idListRef = useRef<any>({})
    const [posts, setPosts] = useState<PostDataWithWriterDto[]>([])
    const [profile, setProfile] = useState<UserProfileWithRelationDTO | null>(null)
    const isThereBlock = (profile as UserProfileWithRelationDTO)?.blockStatus?.user1BlockedUser2 || (profile as UserProfileWithRelationDTO)?.blockStatus?.user2BlockedUser1
    const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: [`posts:${profile?.id}`],
        queryFn: ({ pageParam = 1 }) => getPostsOfUser(profile?.id!, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
        enabled: profile !== null && !isThereBlock
    })
    const queryClient = useQueryClient()

    console.log(data)

    useFocusEffect(useCallback(() => {
        getProfile(params.id).then(setProfile).catch(() => {
            router.back()
        })
        profilePageEvenEmitter.addListener('profileUpdated', onProfileUpdated)

        return () => {
            setProfile(null)
            resetQueries()
            idListRef.current = {}
            setPosts([])
            profilePageEvenEmitter.removeListener('profileUpdated', onProfileUpdated)
        }
    }, []))

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
        }
    }, [data])

    function resetQueries() {
        queryClient.cancelQueries({
            queryKey: [`followings:${params.id}`],
            exact: true
        })
        queryClient.resetQueries({
            queryKey: [`followings:${params.id}`],
            exact: true
        })
        queryClient.cancelQueries({
            queryKey: [`followers:${params.id}`],
            exact: true
        })
        queryClient.resetQueries({
            queryKey: [`followers:${params.id}`],
            exact: true
        })
        queryClient.cancelQueries({
            queryKey: [`posts:${params.id}`],
            exact: true
        })
        queryClient.resetQueries({
            queryKey: [`posts:${params.id}`],
            exact: true
        })
        idListRef.current = {}
        setPosts([])
    }

    function onProfileUpdated() {
        getProfile(params.id).then((res) => {
            setProfile(res)
            resetQueries()
        })
    }

    if (profile === null) {
        return (
            <Surface style={styles.container}>
                <LoadingProfileHeader profile={params} />
                <View>
                    <ActivityIndicator animating={true} size="large" />
                </View>
            </Surface>
        )
    }

    return (
        <Portal.Host>
            <Surface style={styles.container}>
                <ProfileHeader profile={profile} />
                <PostGridViewer posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} />
            </Surface>
        </Portal.Host>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})