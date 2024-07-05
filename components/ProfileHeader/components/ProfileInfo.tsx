import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export interface ProfileInfoProps {
    text: string;
    value: string | number;
    onPress?: () => void;
}

export default function ProfileInfo({ text, value, onPress }: ProfileInfoProps) {
    return (
        <View style={styles.container}>
            <Text>{value}</Text>
            <Text style={{ fontWeight: "bold" }}>{text}</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "center",
        gap: 1
    }
});