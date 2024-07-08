import { StyleSheet, View, Image } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";
import { UserProfileDTO, UserProfileWithRelationDTO } from "@/api/models";
import { i18n } from "@/locales/locales";
import ProfileInfo from "./components/ProfileInfo";
import TopBar from "./components/TopBar";

export interface LoadingProfileHeader {
    profile: {
        name: string;
        username: string;
    }
}
export default function LoadingProfileHeader({ profile }: LoadingProfileHeader) {
    return (
        <Surface style={{ width: "100%" }}>
            <TopBar username={profile.username} />
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.profilePicture}
                        source={require("@/assets/images/noProfilePicture.png")}
                    />
                    <Text style={styles.boldText}>{profile.name}</Text>
                </View>
                <ProfileInfo text={i18n.t("profile.posts")} value={0} />
                <ProfileInfo text={i18n.t("profile.followers")} value={0}/>
                <ProfileInfo text={i18n.t("profile.following")} value={0}/>
            </View>
            <Divider style={styles.divider} />
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: 10
    },
    profilePicture: {
        width: 100,
        height: 100,
        resizeMode: "contain",
        overflow: "hidden",
        borderRadius: 50,
    },
    imageContainer: {
        flexDirection: "column",
        alignItems: "center",
        gap: 5
    },
    boldText: {
        fontWeight: "bold",
    },
    divider: {
        marginTop: 10,
        marginBottom: 10
    }
});