import { Image, StyleSheet, Platform, View, TouchableOpacity, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Login() {
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            
        });
    }, [navigation]);

    return (
        <ThemedView style={styles.titleContainer}>
            <Button title="login" onPress={()=>{
                if(router.canDismiss()){
                    router.dismissAll()
                }
                
            }}></Button>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        gap: 8,
        height: 400,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
