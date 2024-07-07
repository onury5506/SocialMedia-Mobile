import { i18n } from "@/locales/locales";
import { Button } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import EditProfileDrawer from "./EditProfileDrawer";
import { useSelector } from "react-redux";
import { selectProfile } from "@/slices/userSlice";
import { useFocusEffect } from "expo-router";

export function EditProfileButton() {
    const user = useSelector(selectProfile)
    const [showDrawer, setShowDrawer] = useState(false);
    useFocusEffect(useCallback(() => {
        return () => {
            setShowDrawer(false)
        }
    }, []))
    return (
        <View>
            <Button style={styles.editProfileButton} labelStyle={styles.editProfileButtonLabel}
                mode="outlined" onPress={() => { setShowDrawer(true) }}>
                {i18n.t("profile.editProfile")}
            </Button>
            {
                showDrawer && <EditProfileDrawer profile={user!} onClose={() => setShowDrawer(false)} />
            }
        </View>

    )
}

const styles = StyleSheet.create({
    editProfileButton: {
        fontSize: 16,
        marginTop: 10,
        marginLeft: 10,
        padding: 0,
        alignSelf: 'flex-start'
    },
    editProfileButtonLabel: {
        fontSize: 10,
    }
})