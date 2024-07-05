import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { MD2DarkTheme, MD2LightTheme, PaperProvider } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { Provider } from 'react-redux';
import store from '@/store/store';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const darkTheme = {
  ...MD2DarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
  },
};

const lightTheme = {
  ...MD2LightTheme,
  colors: {
    ...MD2LightTheme.colors,
  },
};


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme ? useColorScheme() : 'light';
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider theme={colorScheme == "dark" ? darkTheme : lightTheme}>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1}}>
            <AlertNotificationRoot>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </AlertNotificationRoot>
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
