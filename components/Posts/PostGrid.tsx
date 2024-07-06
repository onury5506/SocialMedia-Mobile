import { PostDataDto } from "@/api/models";
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "react-native-paper";
import * as VideoThumbnails from 'expo-video-thumbnails';

function PostImageGrid({ url }: { url: string }) {
    const theme = useTheme()
    return (
        <Image
            source={{ uri: url }}
            style={{ width: "33%", aspectRatio: 1, backgroundColor: theme.colors.surface }}
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

    if(image) {
        return (
            <Image
                source={{ uri: image }}
                style={{ width: "33%", aspectRatio: 1, backgroundColor: theme.colors.surface }}
                resizeMode="cover"
            />
        )
    }

    return (
        <View style={{ width: "33%", aspectRatio: 1, backgroundColor: theme.colors.surface }}></View>
    )
}

export default function PostGrid({ url, postType }: PostDataDto) {
    const component = useMemo(() => {
        if (postType === 'image') {
            return <PostImageGrid url={url} />
        } else if (postType === 'video') {
            return <PostVideoGrid url={url} />
        }
        return null
    }, [postType])

    return component
}

const styles = StyleSheet.create({

})