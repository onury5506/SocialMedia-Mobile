import { MiniUserProfile } from "@/api/models";
import { Image, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { follow, unfollow } from "@/api/user.api";
import { i18n } from "@/locales/locales";

export default function MiniProfile({ id, username, name, following, profilePicture }: MiniUserProfile) {
    const [isFollowing, setIsFollowing] = useState<boolean>(following)
    const theme = useTheme();
    const _name = name.length <= 15 ? name : name.substring(0, 12) + "...";
    const _username = username.length <= 15 ? username : username.substring(0, 12) + "...";

    useEffect(() => {
        setIsFollowing(following)
    }, [following])

    function handleFollow() {
        setIsFollowing(true)
        follow(id).catch(err => {
            setIsFollowing(false)
        })
    }

    function handleUnfollow() {
        setIsFollowing(false)
        unfollow(id).catch(err => {
            setIsFollowing(true)
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.nameImageContainer}>
                <Image
                    style={styles.profilePicture}
                    source={profilePicture ? { uri: profilePicture } : require("@/assets/images/noProfilePicture.png")}
                />
                <View style={styles.nameContainer}>
                    <Text style={{
                        ...styles.nameText,
                        color: theme.colors.onSurface
                    }}>{_name}</Text>
                    <Text style={{
                        ...styles.userNameText,
                        color: theme.colors.primary
                    }}>@{_username}</Text>
                </View>
            </View>
            {isFollowing && <Button style={styles.button} mode="outlined" onPress={handleUnfollow}><Text style={styles.buttonText}>{i18n.t("unfollow")}</Text></Button>}
            {!isFollowing && <Button style={styles.button} mode="outlined" onPress={handleFollow}><Text style={styles.buttonText}>{i18n.t("follow")}</Text></Button>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        gap: 1,
        marginTop: 3,
        padding: 2
    },
    profilePicture: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        overflow: "hidden",
        borderRadius: 25,
        marginBottom: 5
    },
    followingText: {
        color: "green"
    },
    nameContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        marginLeft: 5
    },
    nameText: {
        fontWeight: "bold",
        fontSize: 15
    },
    userNameText: {
        fontWeight: "light",
        fontSize: 12
    },
    nameImageContainer: {
        width: "50%",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        justifyContent: "flex-start",
    },
    button: {
        width: "40%",
    },
    buttonText: {
        fontSize: 12
    }
});