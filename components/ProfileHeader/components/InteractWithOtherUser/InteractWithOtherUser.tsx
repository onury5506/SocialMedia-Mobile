import { UserProfileWithRelationDTO } from "@/api/models";
import { block, follow, unblock, unfollow } from "@/api/user.api";
import { profilePageEvenEmitter } from "@/app/(tabs)/[user]";
import { i18n } from "@/locales/locales";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function InteractWithOtherUser(props: UserProfileWithRelationDTO) {
    const [status, setStatus] = useState({
        user1FollowedUser2: props.followStatus.user1FollowedUser2,
        user2FollowedUser1: props.followStatus.user2FollowedUser1,
        user1BlockedUser2: props.blockStatus.user1BlockedUser2,
        user2BlockedUser1: props.blockStatus.user2BlockedUser1
    })

    useEffect(() => {
        setStatus({
            user1FollowedUser2: props.followStatus.user1FollowedUser2,
            user2FollowedUser1: props.followStatus.user2FollowedUser1,
            user1BlockedUser2: props.blockStatus.user1BlockedUser2,
            user2BlockedUser1: props.blockStatus.user2BlockedUser1
        })
    }, [props])

    const {
        user1FollowedUser2,
        user2FollowedUser1,
        user1BlockedUser2,
        user2BlockedUser1
    } = status

    function handleFollow() {
        if (user1FollowedUser2) {
            return
        }
        setStatus({
            ...status,
            user1FollowedUser2: true
        })
        follow(props.id).then(() => {
            profilePageEvenEmitter.emit('profileUpdated')
        }).catch(() => {
            setStatus({
                ...status,
                user1FollowedUser2: false
            })
        })
    }

    function handleUnfollow() {
        if (!user1FollowedUser2) {
            return
        }
        setStatus({
            ...status,
            user1FollowedUser2: false
        })
        unfollow(props.id).then(() => {
            profilePageEvenEmitter.emit('profileUpdated')
        }).catch(() => {
            setStatus({
                ...status,
                user1FollowedUser2: true
            })
        })
    }

    function handleBlock() {
        setStatus({
            ...status,
            user1BlockedUser2: true
        })
        block(props.id).then(() => {
            profilePageEvenEmitter.emit('profileUpdated')
        }).catch(() => {
            setStatus({
                ...status,
                user1BlockedUser2: false
            })
        })
    }

    function handleUnblock() {
        setStatus({
            ...status,
            user1BlockedUser2: false
        })
        unblock(props.id).then(() => {
            profilePageEvenEmitter.emit('profileUpdated')
        }).catch(() => {
            setStatus({
                ...status,
                user1BlockedUser2: true
            })
        })
    }

    const prechatUrl = `/prechat?prechatUserId=${props.id}&prechatName=${encodeURIComponent(props.name)}&prechatUserName=${encodeURIComponent(props.username)}&prechatUserPicture=${encodeURIComponent(props.profilePicture)}&prechatUserPictureBlurhash=${encodeURIComponent(props.profilePictureBlurhash || "")}`

    if (user1BlockedUser2) {
        return <UnblockButton handleUnblock={handleUnblock} />
    } else if (user2BlockedUser1) {
        return <BlockButton handleBlock={handleBlock} />
    } else if (user1FollowedUser2) {
        return <UnfollowButton user2FollowingUser1={user2FollowedUser1} handleBlock={handleBlock} handleUnfollow={handleUnfollow} prechatUrl={prechatUrl} />
    } else {
        return <FollowButton user2FollowingUser1={user2FollowedUser1} handleFollow={handleFollow} handleBlock={handleBlock} prechatUrl={prechatUrl} />
    }
}

function FollowButton({ user2FollowingUser1, handleFollow, handleBlock, prechatUrl }: { user2FollowingUser1: boolean, handleFollow: () => void, handleBlock: () => void, prechatUrl: string }) {
    const theme = useTheme()
    return (
        <View style={styles.container}>
            <Button onPress={handleFollow} mode={
                user2FollowingUser1 ? "contained" : "outlined"
            }>
                <Text style={{
                    ...styles.text,
                    color: user2FollowingUser1 ? theme.colors.onPrimary : theme.colors.onSurface
                }}>
                    {i18n.t(user2FollowingUser1 ? 'interactWithOtherProfiles.followYouToo' : 'interactWithOtherProfiles.follow')}
                </Text>
            </Button>
            <Button onPress={handleBlock} mode="outlined">
                <Text style={styles.text}>
                    {i18n.t('interactWithOtherProfiles.block')}
                </Text>
            </Button>
            <Link href={prechatUrl}>
                <Button mode="contained">
                    <Text style={styles.text}>
                        {i18n.t('message')}
                    </Text>
                </Button>
            </Link>
        </View>
    )
}

function UnfollowButton({ user2FollowingUser1, handleBlock, handleUnfollow, prechatUrl }: { user2FollowingUser1: boolean, handleUnfollow: () => void, handleBlock: () => void, prechatUrl: string }) {
    return (
        <View>
            {
                user2FollowingUser1 &&
                <Text style={styles.followsYou}>
                    {i18n.t("interactWithOtherProfiles.followYou")}
                </Text>
            }
            <View style={styles.container}>
                <Button onPress={handleUnfollow} mode="outlined">
                    <Text style={styles.text}>
                        {i18n.t('interactWithOtherProfiles.unfollow')}
                    </Text>
                </Button>
                <Button onPress={handleBlock} mode="outlined">
                    <Text style={styles.text}>
                        {i18n.t('interactWithOtherProfiles.block')}
                    </Text>
                </Button>
                <Link href={prechatUrl}>
                    <Button mode="contained">
                        <Text style={styles.text}>
                            {i18n.t('message')}
                        </Text>
                    </Button>
                </Link>
            </View>
        </View>
    )
}

function UnblockButton({ handleUnblock }: { handleUnblock: () => void }) {
    return (
        <View style={styles.container}>
            <Button onPress={handleUnblock} mode="outlined">
                <Text style={styles.text}>
                    {i18n.t('interactWithOtherProfiles.unblock')}
                </Text>
            </Button>
        </View>
    )
}

function BlockButton({ handleBlock }: { handleBlock: () => void }) {
    return (
        <View style={styles.container}>
            <Button onPress={handleBlock} mode="outlined">
                <Text style={styles.text}>
                    {i18n.t('interactWithOtherProfiles.block')}
                </Text>
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: "100%",
        gap: 5,
        paddingLeft: 10,
    },
    text: {
        fontSize: 10
    },
    followsYou: {
        marginLeft: 10,
        marginBottom: 5
    }
})