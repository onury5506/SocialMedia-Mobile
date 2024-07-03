import { StyleSheet, Image } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { i18n } from '@/locales/locales'
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import api from '@/api/api';

interface loginFormData {
    username: string;
    password: string;
}

export default function Login() {
    const { control, handleSubmit, formState: { errors } } = useForm()
    const navigation = useNavigation();
    const router = useRouter();
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false)

    function onLogin(data: FieldValues) {
        api.auth.login({
            username: data.username,
            password: data.password
        }).then(console.log).catch((err) => {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                textBody: i18n.t(err?.message),
                autoClose: true,
            })
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
                name="username"
                render={({ field: { onChange, value } }) => {
                    return (
                        <TextInput value={value} onChangeText={onChange} style={styles.input} label={i18n.t('login.usernameOrEmail')} />
                    )
                }}

                rules={{
                    required: {
                        value: true,
                        message: "fill"
                    }
                }}
            />

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => {
                    return (
                        <TextInput
                            onChangeText={onChange}
                            style={styles.input}
                            label={i18n.t('login.password')}
                            secureTextEntry={!showPassword}
                            right={<TextInput.Icon onPress={() => setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye"} />}
                        />
                    )
                }}

                rules={{
                    required: {
                        value: true,
                        message: "fill"
                    }
                }}
            />

            <Button onPress={handleSubmit(onLogin)} style={styles.loginButton} mode="outlined">{i18n.t("login.login")}</Button>
            <Text style={{ ...styles.orText, color: theme.colors.onSurface }} variant="bodyMedium">
                {i18n.t("login.dontYouHaveAnAccount")}
                <Text onPress={() => router.navigate('register')} style={{
                    color: theme.colors.primary,
                }}>
                    {'  '}{i18n.t("login.register")}
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
