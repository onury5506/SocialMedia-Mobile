import { StyleSheet } from 'react-native';
import { PostDataWithWriterDto } from '@/api/models';
import { useEffect, useRef, useState } from 'react';
import PostFullViewer from '@/components/Posts/PostFullViewer';
import { feedRefresh, getMeFeed } from '@/api/feed.api';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

export default function HomeScreen() {
  const idListRef = useRef<any>({})
  const [posts, setPosts] = useState<PostDataWithWriterDto[]>([]);
  const [refreshing, setRefreshing] = useState(false)
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [`feed:me`],
    queryFn: ({ pageParam = 1 }) => getMeFeed(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
  })
  const queryClient = useQueryClient()

  function refresh() {
    setRefreshing(true)
    feedRefresh().then(() => {
      queryClient.resetQueries({
        queryKey: [`feed:me`],
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
            queryKey: [`feed:me`],
            exact: true
          })
        })
      }
    }
  }, [data])

  return (
    <PostFullViewer posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} refreshing={refreshing} onRefresh={refresh}/>
  );
}