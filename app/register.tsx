import { StyleSheet, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { i18n } from '@/locales/locales'
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { register } from '@/api/user.api';
import { RegisterUserDTOLanguageEnum } from '@/api/models';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

export default function Register() {
    const { control, handleSubmit, formState: { errors } } = useForm()
    const router = useRouter();
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    function onRegister(data: any) {
        setLoading(true)
        register({
            email: data.email,
            name: data.fullname,
            password: data.password,
            username: data.username,
            language: RegisterUserDTOLanguageEnum.En
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
            let errorMessage = typeof err?.message === "string" ? i18n.t(err?.message) :  i18n.t(err?.message?.[0])
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: errorMessage,
                autoClose: true,
            })
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <Surface style={styles.loginContainer}>
            <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.logo}
            />
            <Controller
                control={control}
                name="fullname"
                render={({ field: { onChange, value } }) => {
                    return (
                        <TextInput value={value} onChangeText={onChange} style={styles.input} label={i18n.t('register.fullname')} />
                    )
                }}
            />
            <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => {
                    return (
                        <TextInput value={value} onChangeText={onChange} style={styles.input} label={i18n.t('register.username')} />
                    )
                }}
            />
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => {
                    return (
                        <TextInput value={value} onChangeText={onChange} style={styles.input} label={i18n.t('register.email')} />
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
                            label={i18n.t('login.password')}
                            secureTextEntry={!showPassword}
                            right={<TextInput.Icon onPress={() => setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye"} />}
                        />
                    )
                }}
            />
            <Button onPress={handleSubmit(onRegister)} style={styles.loginButton} mode="outlined" loading={loading} disabled={loading}>{i18n.t("register.register")}</Button>
            <Text style={{ ...styles.orText, color: theme.colors.onSurface }} variant="bodyMedium">
                {i18n.t("register.doYouHaveAnAccount")}
                <Text onPress={() => router.navigate('/')} style={{
                    color: theme.colors.primary,
                }}>
                    {'  '}{i18n.t("register.login")}
                </Text>
            </Text>
        </Surface>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '80%',
        marginBottom: 10,
    },
    loginButton: {
        borderRadius: 3,
        width: '80%',
    },
    orText: {
        marginTop: 8
    },
    logo: {
        width: "50%",
        resizeMode: "contain",
        marginBottom: 30
    }
});
