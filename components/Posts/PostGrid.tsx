import { PostDataDto, PostDataDtoPostTypeEnum } from "@/api/models";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from 'expo-image';

export interface PostGridProps extends PostDataDto {
    onPress?: (id: string) => void;
}

export default function PostGrid({ id, url, postType, blurHash, thumbnail, onPress }: PostGridProps) {
    function handlePress() {
        if (onPress) {
            onPress(id)
        }
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <Image
                style={styles.image}
                source= {postType === PostDataDtoPostTypeEnum.Image ? url : thumbnail}
                placeholder={{ blurhash: blurHash }}
                contentFit="cover"
                transition={1000}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "33%",
        aspectRatio: 1,
    },
    image: {
        flex: 1,
        width: "100%",
    }
})