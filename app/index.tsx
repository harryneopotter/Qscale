
import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  SafeAreaView, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SplashScreen from '../components/SplashScreen';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

interface RecentFile {
  id: string;
  uri: string;
  name: string;
  timestamp: number;
  operation: string;
}

const shortcuts = [
  { id: 'resize', title: 'Quick Scale', icon: 'resize-outline', color: colors.primary },
  { id: 'crop', title: 'Smart Crop', icon: 'crop-outline', color: colors.secondary },
  { id: 'convert', title: 'Convert Format', icon: 'swap-horizontal-outline', color: colors.accent },
];

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentFiles');
      if (stored) {
        setRecentFiles(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent files:', error);
    }
  };

  const saveRecentFile = async (file: RecentFile) => {
    try {
      const updated = [file, ...recentFiles.filter(f => f.id !== file.id)].slice(0, 5);
      setRecentFiles(updated);
      await AsyncStorage.setItem('recentFiles', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent file:', error);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const selectImage = async (mode?: string) => {
    console.log('Selecting image with mode:', mode);
    setIsLoading(true);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: false,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const fileName = result.assets[0].fileName || 'image';
        
        console.log('Selected image URI:', imageUri);
        
        // Save to recent files
        const recentFile: RecentFile = {
          id: Date.now().toString(),
          uri: imageUri,
          name: fileName,
          timestamp: Date.now(),
          operation: mode || 'imported',
        };
        await saveRecentFile(recentFile);
        
        // Navigate to editor with the image URI and mode
        router.push({
          pathname: '/editor',
          params: { imageUri, mode: mode || 'edit' }
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    console.log('Taking photo...');
    setIsLoading(true);

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera access to take photos.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        base64: false,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const fileName = `photo_${Date.now()}.jpg`;
        
        console.log('Captured image URI:', imageUri);
        
        // Save to recent files
        const recentFile: RecentFile = {
          id: Date.now().toString(),
          uri: imageUri,
          name: fileName,
          timestamp: Date.now(),
          operation: 'captured',
        };
        await saveRecentFile(recentFile);
        
        // Navigate to editor with the image URI
        router.push({
          pathname: '/editor',
          params: { imageUri }
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openRecentFile = (file: RecentFile) => {
    router.push({
      pathname: '/editor',
      params: { imageUri: file.uri }
    });
  };

  const renderRecentFile = ({ item }: { item: RecentFile }) => (
    <TouchableOpacity
      style={{
        width: 120,
        marginRight: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() => openRecentFile(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={{
          width: 120,
          height: 120,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10, 14, 26, 0.9)',
        padding: 8,
      }}>
        <Text style={[commonStyles.textTertiary, { color: colors.white, fontSize: 10 }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[commonStyles.textTertiary, { color: colors.primary, fontSize: 9 }]}>
          {item.operation}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderShortcut = (shortcut: typeof shortcuts[0]) => (
    <TouchableOpacity
      key={shortcut.id}
      style={[commonStyles.card, {
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
        paddingVertical: 24,
        borderColor: colors.border,
        borderWidth: 1,
      }]}
      onPress={() => selectImage(shortcut.id)}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: shortcut.color,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        boxShadow: `0px 4px 16px ${shortcut.color}40`,
        elevation: 6,
      }}>
        <Icon name={shortcut.icon as any} size={24} color={colors.black} />
      </View>
      <Text style={[commonStyles.textSecondary, { fontSize: 12, textAlign: 'center' }]}>
        {shortcut.title}
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded || showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}>
          <Text style={[commonStyles.title, { color: colors.primary }]}>QScale</Text>
          <Text style={commonStyles.textSecondary}>
            Scale. Crop. Convert. Effortlessly.
          </Text>
        </View>

        {/* Main Action Button */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              boxShadow: '0px 8px 32px rgba(0, 229, 255, 0.4)',
              elevation: 12,
            }}
            onPress={() => selectImage()}
            disabled={isLoading}
          >
            <Icon name="add-circle-outline" size={48} color={colors.black} />
            <Text style={[commonStyles.subtitle, { color: colors.black, marginTop: 12, marginBottom: 4, fontWeight: '700' }]}>
              {isLoading ? 'Loading...' : 'Add Image'}
            </Text>
            <Text style={[commonStyles.textSecondary, { color: colors.black, opacity: 0.7, fontWeight: '500' }]}>
              Select from gallery or take a photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {shortcuts.map(renderShortcut)}
          </View>
        </View>

        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16, paddingHorizontal: 24 }]}>
              Recent Files
            </Text>
            <FlatList
              data={recentFiles}
              renderItem={renderRecentFile}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>
        )}

        {/* Alternative Actions */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <Button
            text={isLoading ? "Loading..." : "Take Photo"}
            onPress={takePhoto}
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            textStyle={{ color: colors.text }}
          />
          
          <TouchableOpacity
            style={{
              alignItems: 'center',
              paddingVertical: 16,
            }}
            onPress={() => router.push('/history')}
          >
            <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>
              View Edit History
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
