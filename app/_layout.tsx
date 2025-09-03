
import { Stack, useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { Platform, SafeAreaView } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { commonStyles } from '../styles/commonStyles';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

const STORAGE_KEY = 'natively_emulate_mobile';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [emulate, setEmulate] = useState(false);
  const params = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    setupErrorLogging();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#121212" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: commonStyles.wrapper,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="editor" />
        <Stack.Screen name="history" />
        <Stack.Screen name="export" />
      </Stack>
    </SafeAreaProvider>
  );
}
