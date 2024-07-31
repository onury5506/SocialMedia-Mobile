import { PostDataDto, PostDataWithWriterDto } from '@/api/models';
import { deletePost, getPostsOfUser } from '@/api/post.api';
import { me } from '@/api/user.api';
import PostGridViewer from '@/components/Posts/PostGridViewer';
import ProfileHeader from '@/components/ProfileHeader/ProfileHeader';
import { selectProfile } from '@/slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Surface, Portal } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const user = useSelector(selectProfile)
  const idListRef = useRef<any>({})
  const [posts, setPosts] = useState<PostDataWithWriterDto[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [`posts:${user?.id}`],
    queryFn: ({ pageParam = 1 }) => getPostsOfUser(user?.id!, pageParam),
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

  function tabPress(ev:any) {
    if(!navigation.isFocused()) {
      return
    }
    ev.preventDefault()
    refresh()
  }

  function refresh() {
    setRefreshing(true)
    queryClient.resetQueries({
      queryKey: [`posts:${user?.id}`],
      exact: true
    }).then(() => {
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
    }
  }, [data])

  useFocusEffect(useCallback(() => {
    me().catch(err => { })
  }, []))

  function handleDeletePost(id: string) {
    const index = posts.findIndex(post => post.id === id)

    if (index === -1) {
      return
    }

    setPosts((prev)=>{
      prev.splice(index, 1)
      return [...prev]
    })

    deletePost(id).catch(err => {
      setPosts((prev)=>{
        prev.splice(index, 0, posts[index])
        return [...prev]
      })
    })
  }

  if (user === undefined) {
    return <Surface style={styles.container} children={null} />
  }

  return (
    <Portal.Host>
      <Surface style={styles.container} >
        <ProfileHeader profile={user} />
        <PostGridViewer posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} refreshing={refreshing} onRefresh={refresh} deletePost={handleDeletePost} />
      </Surface>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  }
});
