import { PostDataDto } from "@/api/models";
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import * as VideoThumbnails from 'expo-video-thumbnails';

function PostImageGrid({ url }: { url: string }) {
    const theme = useTheme()
    return (
        <Image
            source={{ uri: url }}
            style={{...styles.content, backgroundColor: theme.colors.surface}}
            resizeMode="cover"
        />
    )
}

function PostVideoGrid({ url }: { url: string }) {
    const theme = useTheme()
    const [image, setImage] = useState("");

    const generateThumbnail = async () => {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(
                url,
                {
                    time: 1000,
                }
            );
            setImage(uri);
        } catch (e) {
            console.warn(e);
        }
    };

    useEffect(() => {
        generateThumbnail();
    }, []);

    if (image) {
        return (
            <Image
                source={{ uri: image }}
                style={{...styles.content, backgroundColor: theme.colors.surface}}
                resizeMode="cover"
            />
        )
    }

    return (
        <View style={{...styles.content, backgroundColor: theme.colors.surface}}></View>
    )
}

export interface PostGridProps extends PostDataDto {
    onPress?: (id: string) => void;
}

export default function PostGrid({ id, url, postType, onPress }: PostGridProps) {
    const component = useMemo(() => {
        if (postType === 'image') {
            return <PostImageGrid url={url} />
        } else if (postType === 'video') {
            return <PostVideoGrid url={url} />
        }
        return null
    }, [postType])

    function handlePress() {
        if (onPress) {
            onPress(id)
        }
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            {component}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "33%",
        aspectRatio: 1,
    },
    content: {
        flex: 1,
        width: "100%",
    }
})