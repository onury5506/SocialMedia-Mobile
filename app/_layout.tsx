import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { MD2DarkTheme, MD2LightTheme, PaperProvider, Portal, useTheme } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { Provider } from 'react-redux';
import store from '@/store/store';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';

const darkTheme = {
  ...MD2DarkTheme,
  myOwnProperty: true,
  colors: {
    ...MD2DarkTheme.colors,
    chatFromUser: "#3E432E",
    chatFromOthers: "#616F39",
    chatText: "#ffffff",
  },
};

const lightTheme = {
  ...MD2LightTheme,
  myOwnProperty: true,
  colors: {
    ...MD2LightTheme.colors,
    chatFromUser: "#AFC8AD",
    chatFromOthers: "#88AB8E",
    chatFromText: "#000000",
  },
};

export type AppTheme = typeof darkTheme;

export const useAppTheme = () => useTheme<AppTheme>();


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export const queryClient = new QueryClient()

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

  const theme = colorScheme == 'dark' ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: "100%", flex: 1, backgroundColor: "white" }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1, width: "100%", backgroundColor: "yellow" }}>
              <QueryClientProvider client={queryClient}>
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
                  <AlertNotificationRoot>
                    <Portal.Host>
                      <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="register" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                    </Portal.Host>
                  </AlertNotificationRoot>
                </SafeAreaView>
              </QueryClientProvider>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
