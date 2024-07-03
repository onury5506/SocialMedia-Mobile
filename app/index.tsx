import { StyleSheet, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { i18n } from '@/locales/locales'
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';

export default function Login() {
    const navigation = useNavigation();
    const router = useRouter();
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        navigation.setOptions({

        });
    }, [navigation]);

    return (
        <Surface style={styles.loginContainer}>
            <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.logo}
            />
            <TextInput style={styles.input} label={i18n.t('login.usernameOrEmail')} />
            <TextInput
                style={styles.input}
                label={i18n.t('login.password')}
                secureTextEntry={!showPassword}
                right={<TextInput.Icon onPress={()=>setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye"} />}
            />
            <Button style={styles.loginButton} mode="outlined">{i18n.t("login.login")}</Button>
            <Text style={{...styles.orText, color: theme.colors.onSurface}} variant="bodyMedium">
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
