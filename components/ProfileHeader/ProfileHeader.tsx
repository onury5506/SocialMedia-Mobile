import { StyleSheet, View } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";
import { UserProfileDTO, UserProfileWithRelationDTO } from "@/api/models";
import { i18n } from "@/locales/locales";
import { selectProfile } from "@/slices/userSlice";
import { useSelector } from "react-redux";
import ProfileInfo from "./components/ProfileInfo";
import { getTranslation } from "@/locales/getTranslation";
import About from "./components/About";
import TopBar from "./components/TopBar";
import { EditProfileButton } from "./components/EditProfile";
import { useEffect, useState } from "react";
import Followers from "./components/Followers";
import { me } from "@/api/user.api";
import Followings from "./components/Followings";
import InteractWithOtherUser from "./components/InteractWithOtherUser/InteractWithOtherUser";
import { Image } from "expo-image";
import { useGlobalSearchParams } from "expo-router";

export interface ProfileHeaderProps {
    profile: UserProfileDTO | UserProfileWithRelationDTO;
}
export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const user = useSelector(selectProfile)
    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowings, setShowFollowings] = useState(false)
    const ownProfile = user?.id === profile.id;
    const globalParams = useGlobalSearchParams()

    useEffect(() => {
        if(showFollowers){
            handelOnFollowersClose()
        }
        if(showFollowings){
            handelOnFollowingsClose()
        }
    }, [globalParams])

    function handelOnFollowersClose(){
        setShowFollowers(false)

        if(ownProfile){
            me().catch(err => {})
        }
    }

    function handelOnFollowingsClose(){
        setShowFollowings(false)

        if(ownProfile){
            me().catch(err => {})
        }
    }

    let isThereNoBlock = !((profile as UserProfileWithRelationDTO)?.blockStatus?.user1BlockedUser2 || (profile as UserProfileWithRelationDTO)?.blockStatus?.user2BlockedUser1)

    return (
        <Surface style={{ width: "100%" }}>
            <TopBar username={profile.username} />
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.profilePicture}
                        source={profile.profilePicture ? { uri: profile.profilePicture } : require("@/assets/images/noProfilePicture.png")}
                        placeholder={{ blurhash: profile.profilePictureBlurhash }}
                    />
                    <Text style={styles.boldText}>{profile.name}</Text>
                </View>
                <ProfileInfo text={i18n.t("profile.posts")} value={profile.postCount} />
                <ProfileInfo text={i18n.t("profile.followers")} value={profile.followerCount} onPress={()=>{isThereNoBlock && setShowFollowers(true)}} />
                <ProfileInfo text={i18n.t("profile.following")} value={profile.followingCount} onPress={()=>{isThereNoBlock && setShowFollowings(true)}} />
            </View>
            <About about={getTranslation(profile.about)} />
            {ownProfile && <EditProfileButton />}
            {!ownProfile && <InteractWithOtherUser {...profile as UserProfileWithRelationDTO}/>}
            <Followers visible={showFollowers} onClose={handelOnFollowersClose} userId={profile.id} />
            <Followings visible={showFollowings} onClose={handelOnFollowingsClose} userId={profile.id} />
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