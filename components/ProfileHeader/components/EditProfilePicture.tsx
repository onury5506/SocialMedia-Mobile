import { Button, Modal, Surface, Text, useTheme } from "react-native-paper";
import { StyleSheet, View, Image } from "react-native";
import { selectProfile } from "@/slices/userSlice";
import { useSelector } from "react-redux";
import { i18n } from "@/locales/locales";
import { useState } from "react";
import { deleteProfilePicture, updateProfilePicture } from "@/api/user.api";
import { Toast, ALERT_TYPE } from "react-native-alert-notification";
import * as ImagePicker from 'expo-image-picker';

export interface EditProfilePictureProps {
    visible: boolean;
    onClose: () => void;
}

export function EditProfilePicture({ visible, onClose }: EditProfilePictureProps) {
    const user = useSelector(selectProfile)
    const theme = useTheme()
    const [loading, setLoading] = useState(false)

    function handleDeleteProfilePicture() {
        setLoading(true)
        deleteProfilePicture().catch(() => {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: i18n.t("somethingWentWrong"),
                autoClose: true,
            })
        }).finally(() => {
            setLoading(false)
        })
    }

    async function pickImage() {
        setLoading(true)
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled || result.assets.length === 0) {
            setLoading(false)
            return;
        }
        
        const uri = result.assets[0].uri;
        const width = result.assets[0].width;
        const extension = result.assets[0].uri.split('.').pop() || "";
        const fileName = result.assets[0].fileName || result.assets[0].uri.split('/').pop() || "";
        const mimeType = `image/${extension == "png" ? "png" : "jpeg"}`

        updateProfilePicture(uri, fileName, mimeType, width).catch((err) => {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: i18n.t("somethingWentWrong"),
                autoClose: true,
            })
        }).finally(() => {
            setLoading(false)
        })
    }

    if (!user) return null
    return (
        <Modal visible={visible} onDismiss={onClose}>
            <View style={styles.container}>
                <Surface style={styles.surface}>
                    <Image
                        style={styles.profilePicture}
                        source={user.profilePicture ? { uri: user.profilePicture } : require("@/assets/images/noProfilePicture.png")}
                    />
                    {
                        user.profilePicture && 
                        <Button mode="outlined"
                            style={{ ...styles.button, borderColor: theme.colors.error }}
                            disabled={loading}
                            loading={loading}
                            onPress={handleDeleteProfilePicture}
                        >
                            <Text
                                style={{ color: theme.colors.error }}
                            >{i18n.t("updateUser.removeProfilePicture")}</Text>
                        </Button>
                    }
                    <Button style={styles.button} mode="outlined"
                        disabled={loading}
                        loading={loading}
                        onPress={pickImage}
                    >
                        <Text>{i18n.t("updateUser.editProfilePicture")}</Text>
                    </Button>
                </Surface>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: "100%",
        alignContent: "center",
        justifyContent: "center",
    },
    surface: {
        width: "80%",
        flexDirection: 'column',
        alignItems: "center",
        padding: 10,
        paddingTop: 20,
        paddingBottom: 20
    },
    profilePicture: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        overflow: "hidden",
        borderRadius: 100,
        marginBottom: 20
    },
    button: {
        marginTop: 10,
        minWidth: "95%"
    }
});