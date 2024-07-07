import { PostDataWithWriterDto, PostDataWithWriterDtoPostTypeEnum } from "@/api/models";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from 'expo-image';
import { Icon } from "react-native-paper";

export interface PostGridProps extends PostDataWithWriterDto {
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
                source={postType === PostDataWithWriterDtoPostTypeEnum.Image ? url : thumbnail}
                placeholder={{ blurhash: blurHash }}
                contentFit="cover"
                transition={1000}
            />
            {
                postType === PostDataWithWriterDtoPostTypeEnum.Video && <View style={styles.videoIcon}><Icon
                    source="movie-play"
                    size={20}
                    color="white"
                />
                </View>
            }
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
    },
    videoIcon: {
        position: "absolute",
        right: 5,
        top: 5,
    }
})