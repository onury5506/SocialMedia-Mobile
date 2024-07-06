import { UpdateUserDTO, UserProfileDTO } from "@/api/models";
import { Button, Divider, Portal, Surface, TextInput } from "react-native-paper";
import { Dimensions, StyleSheet, Image, View, TouchableOpacity, BackHandler, KeyboardAvoidingView, Platform } from "react-native";
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { i18n } from "@/locales/locales";
import { getTranslation } from "@/locales/getTranslation";
import { updateUser } from "@/api/user.api";
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { EditProfilePicture } from "./EditProfilePicture";

export interface EditProfileDrawerProps {
    profile: UserProfileDTO;
    onClose: () => void;
}

export default function EditProfileDrawer({ profile, onClose }: EditProfileDrawerProps) {
    const { control, handleSubmit, formState: { errors, isDirty, dirtyFields } } = useForm({
        defaultValues: {
            name: profile.name,
            username: profile.username,
            about: getTranslation(profile.about),
            oldPassword: "",
            password: ""
        }
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showEditProfileModal, setShowEditProfileModal] = useState(false)
    const translateY = useSharedValue(Dimensions.get('window').height);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }]
        }
    })

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleClose);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleClose);
        }
    })

    useEffect(() => {
        translateY.value = withSpring(0, {
            mass: 1,
            damping: 43,
            stiffness: 319,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        });
    }, [])
    function handleClose() {
        translateY.value = withSpring(Dimensions.get('window').height, {
            mass: 1,
            damping: 43,
            stiffness: 319,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        });

        setTimeout(() => {
            onClose();
        }, 300)

        return true
    }

    function onSubmit(data: any) {
        const updateData: UpdateUserDTO = {
        }

        const keys = Object.keys(dirtyFields);

        if (keys.length === 0) {
            return;
        }

        keys.forEach(key => {
            updateData[key as keyof UpdateUserDTO] = data[key];
        })
        setLoading(true)
        updateUser(updateData).then(() => {
            handleClose()
        }).catch((err) => {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: i18n.t(err?.message),
                autoClose: true,
            })
        }).finally(() => {
            setLoading(false)
        })
    }




    return (
        <Portal>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: "100%", flex: 1 }}>
                <Animated.View style={[styles.container, animatedStyles]}>
                    <Surface style={styles.container}>
                        <TouchableOpacity onPress={() => { setShowEditProfileModal(true) }}>
                            <Image
                                style={styles.profilePicture}
                                source={profile.profilePicture ? { uri: profile.profilePicture } : require("@/assets/images/noProfilePicture.png")}
                            />
                        </TouchableOpacity>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => {
                                return (
                                    <TextInput
                                        value={value} onChangeText={onChange}
                                        style={styles.input}
                                        label={i18n.t('updateUser.name')}
                                    />
                                )
                            }}
                        />

                        <Divider style={styles.divider} />

                        <Controller
                            control={control}
                            name="username"
                            render={({ field: { onChange, value } }) => {
                                return (
                                    <TextInput
                                        value={value} onChangeText={onChange}
                                        style={styles.input}
                                        label={i18n.t('updateUser.username')}
                                    />
                                )
                            }}
                        />

                        <Divider style={styles.divider} />

                        <Controller
                            control={control}
                            name="about"
                            render={({ field: { onChange, value } }) => {
                                return (
                                    <TextInput
                                        value={value} onChangeText={onChange}
                                        style={styles.input}
                                        label={i18n.t('updateUser.about')}
                                    />
                                )
                            }}
                        />

                        <Divider style={styles.divider} />

                        <Controller
                            control={control}
                            name="oldPassword"
                            render={({ field: { onChange, value } }) => {
                                return (
                                    <TextInput
                                        value={value} onChangeText={onChange}
                                        style={styles.input}
                                        label={i18n.t('updateUser.oldPassword')}
                                        secureTextEntry={!showPassword}
                                        right={<TextInput.Icon onPress={() => setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye"} />}
                                    />
                                )
                            }}
                        />
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => {
                                return (
                                    <TextInput
                                        value={value} onChangeText={onChange}
                                        style={styles.input}
                                        label={i18n.t('updateUser.newPassword')}
                                        secureTextEntry={!showPassword}
                                        right={<TextInput.Icon onPress={() => setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye"} />}
                                    />
                                )
                            }}
                        />

                        <View style={styles.buttonsContainer}>
                            <Button onPress={handleSubmit(onSubmit)} loading={loading} disabled={!isDirty || loading}>{i18n.t("updateUser.save")}</Button>
                            <Button onPress={handleClose} disabled={loading}>{i18n.t(isDirty ? "updateUser.cancel" : "updateUser.close")}</Button>
                        </View>


                    </Surface>
                </Animated.View>
            </KeyboardAvoidingView>
            <EditProfilePicture visible={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} />
        </Portal >

    )
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    input: {
        width: '80%',
        marginBottom: 5,
    },
    divider: {
        width: "100%",
        marginBottom: 5
    },
    profilePicture: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        overflow: "hidden",
        borderRadius: 100,
        marginBottom: 20
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "80%"
    }
})