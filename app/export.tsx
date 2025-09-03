
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';

const { width } = Dimensions.get('window');

interface ExportOptions {
  quality: number;
  format: 'png' | 'jpeg';
  fileName: string;
}

export default function ExportScreen() {
  const { imageUri, operation = 'edited' } = useLocalSearchParams<{ 
    imageUri: string; 
    operation?: string; 
  }>();
  
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    quality: 90,
    format: 'jpeg',
    fileName: `image_${operation}_${Date.now()}`,
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (imageUri) {
      loadImageInfo();
    }
  }, [imageUri]);

  const loadImageInfo = async () => {
    try {
      Image.getSize(imageUri, async (width, height) => {
        let size = 0;
        try {
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          size = fileInfo.size || 0;
        } catch (error) {
          console.log('Could not get file size:', error);
        }
        
        setImageInfo({ width, height, size });
      });
    } catch (error) {
      console.error('Error loading image info:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const saveToGallery = async () => {
    setIsExporting(true);
    try {
      if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'We need permission to save images to your gallery.');
          return;
        }

        const asset = await MediaLibrary.createAssetAsync(imageUri);
        console.log('Image saved to gallery:', asset);
        
        // Success animation
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          'Success! 🎉',
          'Image saved to gallery successfully!',
          [
            { text: 'OK', onPress: () => router.push('/') }
          ]
        );
      } else {
        // Web download
        const link = document.createElement('a');
        link.href = imageUri;
        link.download = `${exportOptions.fileName}.${exportOptions.format}`;
        link.click();
        
        Alert.alert(
          'Success! 🎉',
          'Image downloaded successfully!',
          [
            { text: 'OK', onPress: () => router.push('/') }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image.');
    } finally {
      setIsExporting(false);
    }
  };

  const shareImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Share.share({
          url: imageUri,
          title: 'Edited Image',
          message: 'Check out this image I edited with QScale!',
        });
      } else {
        // Web share API or fallback
        if (navigator.share) {
          await navigator.share({
            title: 'Edited Image',
            text: 'Check out this image I edited with QScale!',
            url: imageUri,
          });
        } else {
          // Fallback to copying URL
          navigator.clipboard.writeText(imageUri);
          Alert.alert('Link Copied', 'Image link copied to clipboard!');
        }
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image.');
    }
  };

  const editAgain = () => {
    router.push({
      pathname: '/editor',
      params: { imageUri }
    });
  };

  if (!imageInfo) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Loading export preview...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayWidth = width - 48;
  const displayHeight = (displayWidth * imageInfo.height) / imageInfo.width;

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>QScale Export</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1, padding: 24 }}>
        {/* Preview */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 24 }]}>
          <Image
            source={{ uri: imageUri }}
            style={{
              width: displayWidth,
              height: displayHeight,
              borderRadius: 12,
              marginBottom: 16,
            }}
            resizeMode="contain"
          />
          
          {/* Image Details */}
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>
              Export Preview
            </Text>
            <Text style={commonStyles.text}>
              {imageInfo.width} × {imageInfo.height} pixels
            </Text>
            <Text style={commonStyles.textSecondary}>
              {formatFileSize(imageInfo.size)} • {exportOptions.format.toUpperCase()}
            </Text>
            <Text style={commonStyles.textTertiary}>
              Quality: {exportOptions.quality}%
            </Text>
          </View>
        </View>

        {/* Export Actions */}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Button
            text={isExporting ? "Saving..." : "Save to Gallery"}
            onPress={saveToGallery}
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            disabled={isExporting}
          />
          
          <Button
            text="Share Image"
            onPress={shareImage}
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            textStyle={{ color: colors.text }}
          />
          
          <Button
            text="Edit Again"
            onPress={editAgain}
            style={[buttonStyles.outline, { marginBottom: 12 }]}
            textStyle={{ color: colors.primary }}
          />
          
          <TouchableOpacity
            style={{ alignItems: 'center', paddingVertical: 16 }}
            onPress={() => router.push('/')}
          >
            <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>
              Start New Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
