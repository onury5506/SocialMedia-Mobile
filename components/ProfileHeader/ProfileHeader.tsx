import { StyleSheet, View, Image } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";
import { UserProfileDTO } from "@/api/models";
import { i18n } from "@/locales/locales";
import { selectProfile } from "@/slices/userSlice";
import { useSelector } from "react-redux";
import ProfileInfo from "./components/ProfileInfo";
import { getLocales } from "expo-localization";
import { getTranslation } from "@/locales/getTranslation";
import About from "./components/About";
import TopBar from "./components/TopBar";
import { EditProfileButton } from "./components/EditProfile";

export interface ProfileHeaderProps {
    profile: UserProfileDTO;
}
export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const user = useSelector(selectProfile)

    const ownProfile = user?.id === profile.id;
    return (
        <Surface style={{ width: "100%" }}>
            <TopBar username={profile.username} />
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.profilePicture}
                        source={profile.profilePicture ? { uri: profile.profilePicture } : require("@/assets/images/noProfilePicture.png")}
                    />
                    <Text style={styles.boldText}>{profile.name}</Text>
                </View>
                <ProfileInfo text={i18n.t("profile.posts")} value={profile.postCount} />
                <ProfileInfo text={i18n.t("profile.followers")} value={profile.followerCount} />
                <ProfileInfo text={i18n.t("profile.following")} value={profile.followingCount} />
            </View>
            <About about={getTranslation(profile.about)} />
            {ownProfile && <EditProfileButton />}
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