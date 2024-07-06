import { PostDataDto } from '@/api/models';
import { getPostsOfUser } from '@/api/post.api';
import { me } from '@/api/user.api';
import PostGrid from '@/components/Posts/PostGrid';
import ProfileHeader from '@/components/ProfileHeader/ProfileHeader';
import { selectProfile } from '@/slices/userSlice';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const user = useSelector(selectProfile)
  const idListRef = useRef<any>({})
  const [posts, setPosts] = useState<PostDataDto[]>([])
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [`posts:${user?.id}`],
    queryFn: ({ pageParam = 1 }) => getPostsOfUser(user?.id!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (data) {
      const newPosts: PostDataDto[] = []
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

  function reset() {
    idListRef.current = {}
    setPosts([])
    queryClient.cancelQueries({
      queryKey: [`posts:${user?.id}`],
      exact: true
    })
    queryClient.resetQueries({
      queryKey: [`posts:${user?.id}`],
      exact: true
    })
  }

  useFocusEffect(useCallback(() => {
    me().catch(err => { })

    return reset
  }, []))

  if (user === undefined) {
    return <Surface style={styles.container} children={null} />
  }

  return (
    <Surface style={styles.container} >
      <ProfileHeader profile={user} />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostGrid {...item} />}
        numColumns={3}
        style={styles.gridList}
        columnWrapperStyle={{ justifyContent: 'flex-start', gap: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        onEndReached={(thresh) => hasNextPage && fetchNextPage()}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  gridList: {
    width: '100%',
  }
});
