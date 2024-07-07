import { PostDataDto } from "@/api/models";
import { FlatList, StyleSheet, View } from 'react-native';
import PostGrid from "./PostGrid";

export interface PostGridViewerProps {
    posts: PostDataDto[];
    hasNextPage: boolean;
    fetchNextPage: () => void;
}

export default function PostGridViewer({ posts, hasNextPage, fetchNextPage }: PostGridViewerProps) {

    return (
        <>
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
        </>
    )
}

const styles = StyleSheet.create({
    gridList: {
        width: '100%',
    }
});