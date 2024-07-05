import { router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";

export interface TopBarProps {
    username: string;
}

export default function TopBar({ username }: TopBarProps) {
    return (
        <View style={styles.container}>
            { router.canGoBack() && <IconButton style={styles.backButton} icon="chevron-left" onPress={router.back} size={35} /> }
            <Text style={styles.username}>{username}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        paddingTop: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
    },
    backButton: {
        position: "absolute",
        left: -10,
        top: -8
    }
});