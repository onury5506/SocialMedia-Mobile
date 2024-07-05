import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export interface AboutProps {
    about: string;
}

export default function About({ about }: AboutProps) {
    return (
        <View style={styles.container}>
            <Text>{about}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 12
    }
});