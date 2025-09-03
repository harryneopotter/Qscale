
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
}

interface EditHistory {
  id: string;
  operation: string;
  uri: string;
  timestamp: number;
}

const socialPresets = [
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Cover', width: 1200, height: 630 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'Twitter Header', width: 1500, height: 500 },
];

const commonResolutions = [
  { name: 'HD', width: 1920, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
  { name: 'Square HD', width: 1080, height: 1080 },
  { name: 'Portrait HD', width: 1080, height: 1920 },
];

const cropRatios = [
  { name: 'Free', ratio: null },
  { name: '1:1', ratio: 1 },
  { name: '4:3', ratio: 4/3 },
  { name: '16:9', ratio: 16/9 },
  { name: '3:2', ratio: 3/2 },
  { name: '9:16', ratio: 9/16 },
];

export default function EditorScreen() {
  const { imageUri, mode } = useLocalSearchParams<{ imageUri: string; mode?: string }>();
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'resize' | 'crop' | 'convert'>('resize');
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // Resize states
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percent'>('pixels');
  const [resizePercent, setResizePercent] = useState(100);
  
  // Crop states
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [selectedCropRatio, setSelectedCropRatio] = useState(cropRatios[0]);
  const [showGrid, setShowGrid] = useState(true);
  const [cropMode, setCropMode] = useState<'rectangle' | 'circle'>('rectangle');
  
  // Convert states
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [jpegQuality, setJpegQuality] = useState(90);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  
  // UI states
  const [imageScale, setImageScale] = useState(1);
  const [imageTranslateX, setImageTranslateX] = useState(0);
  const [imageTranslateY, setImageTranslateY] = useState(0);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const originalAspectRatio = useRef<number>(1);

  useEffect(() => {
    if (imageUri) {
      loadImageInfo();
      if (mode) {
        setActiveTab(mode as any);
        setTimeout(() => bottomSheetRef.current?.expand(), 500);
      }
    }
  }, [imageUri, mode]);

  const loadImageInfo = async () => {
    try {
      console.log('Loading image info for:', imageUri);
      
      Image.getSize(
        imageUri,
        (width, height) => {
          console.log('Image dimensions:', width, 'x', height);
          const format = imageUri.toLowerCase().includes('.png') ? 'png' : 'jpeg';
          
          const info: ImageInfo = {
            uri: imageUri,
            width,
            height,
            format,
          };
          
          setImageInfo(info);
          setNewWidth(width.toString());
          setNewHeight(height.toString());
          setCropWidth(width);
          setCropHeight(height);
          setOutputFormat(format);
          originalAspectRatio.current = width / height;
          
          // Add to history
          addToHistory('original', imageUri);
        },
        (error) => {
          console.error('Error getting image size:', error);
          Alert.alert('Error', 'Failed to load image information.');
        }
      );
    } catch (error) {
      console.error('Error loading image info:', error);
      Alert.alert('Error', 'Failed to load image.');
    }
  };

  const addToHistory = (operation: string, uri: string) => {
    const historyItem: EditHistory = {
      id: Date.now().toString(),
      operation,
      uri,
      timestamp: Date.now(),
    };
    
    const newHistory = [...editHistory.slice(0, currentHistoryIndex + 1), historyItem];
    setEditHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      const previousIndex = currentHistoryIndex - 1;
      const previousItem = editHistory[previousIndex];
      setCurrentHistoryIndex(previousIndex);
      
      // Load previous image
      setImageInfo(prev => prev ? { ...prev, uri: previousItem.uri } : null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < editHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      const nextItem = editHistory[nextIndex];
      setCurrentHistoryIndex(nextIndex);
      
      // Load next image
      setImageInfo(prev => prev ? { ...prev, uri: nextItem.uri } : null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const updateAspectRatio = (width: string, isWidth: boolean) => {
    if (!aspectRatioLocked || !imageInfo) return;
    
    const numWidth = parseInt(width);
    if (isNaN(numWidth)) return;
    
    if (isWidth) {
      const newHeight = Math.round(numWidth / originalAspectRatio.current);
      setNewHeight(newHeight.toString());
    } else {
      const newWidth = Math.round(numWidth * originalAspectRatio.current);
      setNewWidth(newWidth.toString());
    }
  };

  const applyPreset = (preset: { width: number; height: number }) => {
    setNewWidth(preset.width.toString());
    setNewHeight(preset.height.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const applyCropRatio = (ratio: typeof cropRatios[0]) => {
    setSelectedCropRatio(ratio);
    if (ratio.ratio && imageInfo) {
      const maxWidth = imageInfo.width;
      const maxHeight = imageInfo.height;
      
      let newCropWidth, newCropHeight;
      
      if (maxWidth / maxHeight > ratio.ratio) {
        newCropHeight = maxHeight;
        newCropWidth = Math.round(maxHeight * ratio.ratio);
      } else {
        newCropWidth = maxWidth;
        newCropHeight = Math.round(maxWidth / ratio.ratio);
      }
      
      setCropWidth(newCropWidth);
      setCropHeight(newCropHeight);
      setCropX(Math.round((maxWidth - newCropWidth) / 2));
      setCropY(Math.round((maxHeight - newCropHeight) / 2));
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resizeImage = async () => {
    if (!imageInfo || !newWidth || !newHeight) {
      Alert.alert('Error', 'Please enter valid width and height values.');
      return;
    }

    setIsProcessing(true);
    console.log('Resizing image to:', newWidth, 'x', newHeight);

    try {
      const targetWidth = resizeMode === 'percent' 
        ? Math.round(imageInfo.width * resizePercent / 100)
        : parseInt(newWidth);
      const targetHeight = resizeMode === 'percent'
        ? Math.round(imageInfo.height * resizePercent / 100)
        : parseInt(newHeight);

      const result = await ImageManipulator.manipulateAsync(
        imageInfo.uri,
        [{ resize: { width: targetWidth, height: targetHeight } }],
        {
          compress: jpegQuality / 100,
          format: outputFormat === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('Resize result:', result);
      setImageInfo({ ...imageInfo, uri: result.uri, width: targetWidth, height: targetHeight });
      addToHistory('resized', result.uri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.close();
      
      // Navigate to export screen
      router.push({
        pathname: '/export',
        params: { imageUri: result.uri, operation: 'resized' }
      });
    } catch (error) {
      console.error('Error resizing image:', error);
      Alert.alert('Error', 'Failed to resize image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cropImage = async () => {
    if (!imageInfo) return;

    setIsProcessing(true);
    console.log('Cropping image:', { x: cropX, y: cropY, width: cropWidth, height: cropHeight });

    try {
      const manipulations: ImageManipulator.Action[] = [
        {
          crop: {
            originX: cropX,
            originY: cropY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ];

      const result = await ImageManipulator.manipulateAsync(
        imageInfo.uri,
        manipulations,
        {
          compress: jpegQuality / 100,
          format: outputFormat === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('Crop result:', result);
      setImageInfo({ ...imageInfo, uri: result.uri, width: cropWidth, height: cropHeight });
      addToHistory('cropped', result.uri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.close();
      
      // Navigate to export screen
      router.push({
        pathname: '/export',
        params: { imageUri: result.uri, operation: 'cropped' }
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Error', 'Failed to crop image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertImage = async () => {
    if (!imageInfo) return;

    setIsProcessing(true);
    console.log('Converting image to:', outputFormat);

    try {
      const result = await ImageManipulator.manipulateAsync(
        imageInfo.uri,
        [],
        {
          compress: jpegQuality / 100,
          format: outputFormat === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('Convert result:', result);
      setImageInfo({ ...imageInfo, uri: result.uri, format: outputFormat });
      addToHistory('converted', result.uri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.close();
      
      // Navigate to export screen
      router.push({
        pathname: '/export',
        params: { imageUri: result.uri, operation: 'converted' }
      });
    } catch (error) {
      console.error('Error converting image:', error);
      Alert.alert('Error', 'Failed to convert image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveImage = async () => {
    if (!imageInfo) return;

    try {
      if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'We need permission to save images to your gallery.');
          return;
        }

        const asset = await MediaLibrary.createAssetAsync(imageInfo.uri);
        console.log('Image saved to gallery:', asset);
        
        // Confetti animation effect
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success! 🎉', 'Image saved to gallery successfully!');
      } else {
        const link = document.createElement('a');
        link.href = imageInfo.uri;
        link.download = `edited_image.${outputFormat}`;
        link.click();
        Alert.alert('Success! 🎉', 'Image downloaded successfully!');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  const renderTabButton = (tab: 'resize' | 'crop' | 'convert', icon: string, title: string) => (
    <TouchableOpacity
      style={[commonStyles.tab, activeTab === tab && commonStyles.tabActive]}
      onPress={() => {
        setActiveTab(tab);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <Icon name={icon as any} size={20} color={activeTab === tab ? colors.white : colors.textSecondary} />
      <Text style={[
        commonStyles.tabText,
        activeTab === tab && commonStyles.tabTextActive,
        { marginTop: 4 }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderResizeContent = () => (
    <View>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
        Resize Image
      </Text>
      
      {/* Mode Toggle */}
      <View style={[commonStyles.tabContainer, { marginBottom: 20 }]}>
        <TouchableOpacity
          style={[commonStyles.tab, resizeMode === 'pixels' && commonStyles.tabActive]}
          onPress={() => setResizeMode('pixels')}
        >
          <Text style={[commonStyles.tabText, resizeMode === 'pixels' && commonStyles.tabTextActive]}>
            Pixels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.tab, resizeMode === 'percent' && commonStyles.tabActive]}
          onPress={() => setResizeMode('percent')}
        >
          <Text style={[commonStyles.tabText, resizeMode === 'percent' && commonStyles.tabTextActive]}>
            Percent
          </Text>
        </TouchableOpacity>
      </View>

      {resizeMode === 'pixels' ? (
        <View>
          {/* Aspect Ratio Lock */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              padding: 12,
              backgroundColor: colors.surface,
              borderRadius: 8,
            }}
            onPress={() => {
              setAspectRatioLocked(!aspectRatioLocked);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Icon 
              name={aspectRatioLocked ? "lock-closed" : "lock-open"} 
              size={20} 
              color={aspectRatioLocked ? colors.primary : colors.textSecondary} 
            />
            <Text style={[commonStyles.text, { marginLeft: 8, marginBottom: 0 }]}>
              Lock Aspect Ratio
            </Text>
          </TouchableOpacity>

          {/* Dimensions */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 8 }]}>Width:</Text>
              <TextInput
                style={commonStyles.input}
                value={newWidth}
                onChangeText={(text) => {
                  setNewWidth(text);
                  updateAspectRatio(text, true);
                }}
                keyboardType="numeric"
                placeholder="Width"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 8 }]}>Height:</Text>
              <TextInput
                style={commonStyles.input}
                value={newHeight}
                onChangeText={(text) => {
                  setNewHeight(text);
                  updateAspectRatio(text, false);
                }}
                keyboardType="numeric"
                placeholder="Height"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Presets */}
          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>Social Media:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {socialPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={commonStyles.presetButton}
                onPress={() => applyPreset(preset)}
              >
                <Text style={commonStyles.presetButtonText}>{preset.name}</Text>
                <Text style={[commonStyles.presetButtonText, { fontSize: 10, opacity: 0.7 }]}>
                  {preset.width}×{preset.height}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>Common Sizes:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {commonResolutions.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={commonStyles.presetButton}
                onPress={() => applyPreset(preset)}
              >
                <Text style={commonStyles.presetButtonText}>{preset.name}</Text>
                <Text style={[commonStyles.presetButtonText, { fontSize: 10, opacity: 0.7 }]}>
                  {preset.width}×{preset.height}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View>
          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>
            Scale: {resizePercent}%
          </Text>
          <Slider
            style={commonStyles.slider}
            minimumValue={10}
            maximumValue={500}
            value={resizePercent}
            onValueChange={(value) => {
              setResizePercent(Math.round(value));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbStyle={{ backgroundColor: colors.primary }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={commonStyles.textSecondary}>10%</Text>
            <Text style={commonStyles.textSecondary}>500%</Text>
          </View>
        </View>
      )}

      <Button
        text={isProcessing ? "Processing..." : "Apply Resize"}
        onPress={resizeImage}
        style={buttonStyles.primary}
        disabled={isProcessing}
      />
    </View>
  );

  const renderCropContent = () => (
    <View>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
        Crop Image
      </Text>

      {/* Crop Mode */}
      <View style={[commonStyles.tabContainer, { marginBottom: 20 }]}>
        <TouchableOpacity
          style={[commonStyles.tab, cropMode === 'rectangle' && commonStyles.tabActive]}
          onPress={() => setCropMode('rectangle')}
        >
          <Text style={[commonStyles.tabText, cropMode === 'rectangle' && commonStyles.tabTextActive]}>
            Rectangle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.tab, cropMode === 'circle' && commonStyles.tabActive]}
          onPress={() => setCropMode('circle')}
        >
          <Text style={[commonStyles.tabText, cropMode === 'circle' && commonStyles.tabTextActive]}>
            Circle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Aspect Ratios */}
      <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>Aspect Ratio:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {cropRatios.map((ratio, index) => (
          <TouchableOpacity
            key={index}
            style={[
              commonStyles.presetButton,
              selectedCropRatio.name === ratio.name && commonStyles.presetButtonActive
            ]}
            onPress={() => applyCropRatio(ratio)}
          >
            <Text style={[
              commonStyles.presetButtonText,
              selectedCropRatio.name === ratio.name && commonStyles.presetButtonTextActive
            ]}>
              {ratio.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid Toggle */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          padding: 12,
          backgroundColor: colors.surface,
          borderRadius: 8,
        }}
        onPress={() => {
          setShowGrid(!showGrid);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Icon 
          name={showGrid ? "grid" : "grid-outline"} 
          size={20} 
          color={showGrid ? colors.primary : colors.textSecondary} 
        />
        <Text style={[commonStyles.text, { marginLeft: 8, marginBottom: 0 }]}>
          Show Grid (Rule of Thirds)
        </Text>
      </TouchableOpacity>

      {/* Manual Crop Values */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[commonStyles.textSecondary, { textAlign: 'left', marginBottom: 4 }]}>X:</Text>
            <TextInput
              style={[commonStyles.input, { fontSize: 14, padding: 12 }]}
              value={cropX.toString()}
              onChangeText={(text) => setCropX(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[commonStyles.textSecondary, { textAlign: 'left', marginBottom: 4 }]}>Y:</Text>
            <TextInput
              style={[commonStyles.input, { fontSize: 14, padding: 12 }]}
              value={cropY.toString()}
              onChangeText={(text) => setCropY(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[commonStyles.textSecondary, { textAlign: 'left', marginBottom: 4 }]}>Width:</Text>
            <TextInput
              style={[commonStyles.input, { fontSize: 14, padding: 12 }]}
              value={cropWidth.toString()}
              onChangeText={(text) => setCropWidth(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="Width"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[commonStyles.textSecondary, { textAlign: 'left', marginBottom: 4 }]}>Height:</Text>
            <TextInput
              style={[commonStyles.input, { fontSize: 14, padding: 12 }]}
              value={cropHeight.toString()}
              onChangeText={(text) => setCropHeight(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="Height"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>

      <Button
        text={isProcessing ? "Processing..." : "Apply Crop"}
        onPress={cropImage}
        style={buttonStyles.primary}
        disabled={isProcessing}
      />
    </View>
  );

  const renderConvertContent = () => (
    <View>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
        Convert Format
      </Text>

      {/* Format Selection */}
      <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>Output Format:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TouchableOpacity
          style={[
            commonStyles.presetButton,
            { flex: 1, marginRight: 8, alignItems: 'center' },
            outputFormat === 'jpeg' && commonStyles.presetButtonActive
          ]}
          onPress={() => setOutputFormat('jpeg')}
        >
          <Text style={[
            commonStyles.presetButtonText,
            outputFormat === 'jpeg' && commonStyles.presetButtonTextActive
          ]}>
            JPEG
          </Text>
          <Text style={[
            commonStyles.textTertiary,
            { fontSize: 10 },
            outputFormat === 'jpeg' && { color: colors.white }
          ]}>
            Smaller size
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.presetButton,
            { flex: 1, marginLeft: 8, alignItems: 'center' },
            outputFormat === 'png' && commonStyles.presetButtonActive
          ]}
          onPress={() => setOutputFormat('png')}
        >
          <Text style={[
            commonStyles.presetButtonText,
            outputFormat === 'png' && commonStyles.presetButtonTextActive
          ]}>
            PNG
          </Text>
          <Text style={[
            commonStyles.textTertiary,
            { fontSize: 10 },
            outputFormat === 'png' && { color: colors.white }
          ]}>
            Transparency
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quality Slider for JPEG */}
      {outputFormat === 'jpeg' && (
        <View style={{ marginBottom: 20 }}>
          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>
            Quality: {jpegQuality}%
          </Text>
          <Slider
            style={commonStyles.slider}
            minimumValue={10}
            maximumValue={100}
            value={jpegQuality}
            onValueChange={(value) => {
              setJpegQuality(Math.round(value));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbStyle={{ backgroundColor: colors.primary }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={commonStyles.textSecondary}>Lower size</Text>
            <Text style={commonStyles.textSecondary}>Higher quality</Text>
          </View>
        </View>
      )}

      {/* Background Color for PNG to JPEG */}
      {imageInfo?.format === 'png' && outputFormat === 'jpeg' && (
        <View style={{ marginBottom: 20 }}>
          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 12 }]}>
            Background Color (for transparency):
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'].map((color) => (
              <TouchableOpacity
                key={color}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: color,
                  borderWidth: backgroundColor === color ? 3 : 1,
                  borderColor: backgroundColor === color ? colors.primary : colors.border,
                }}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>
        </View>
      )}

      <Button
        text={isProcessing ? "Processing..." : "Convert Image"}
        onPress={convertImage}
        style={buttonStyles.primary}
        disabled={isProcessing}
      />
    </View>
  );

  if (!imageInfo) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Icon name="image-outline" size={60} color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: 16 }]}>Loading image...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayWidth = screenWidth - 48;
  const displayHeight = (displayWidth * imageInfo.height) / imageInfo.width;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={commonStyles.container}>
        {/* Header */}
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>QScale Editor</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={undo}
              disabled={currentHistoryIndex <= 0}
              style={{ marginRight: 16, opacity: currentHistoryIndex <= 0 ? 0.3 : 1 }}
            >
              <Icon name="arrow-undo" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={redo}
              disabled={currentHistoryIndex >= editHistory.length - 1}
              style={{ opacity: currentHistoryIndex >= editHistory.length - 1 ? 0.3 : 1 }}
            >
              <Icon name="arrow-redo" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Display */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          <View style={[commonStyles.card, { alignItems: 'center' }]}>
            <Image
              source={{ uri: imageInfo.uri }}
              style={{
                width: displayWidth,
                height: displayHeight,
                borderRadius: 12,
              }}
              resizeMode="contain"
            />
            
            {/* Image Info */}
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={commonStyles.text}>
                {imageInfo.width} × {imageInfo.height} px
              </Text>
              <Text style={commonStyles.textSecondary}>
                {imageInfo.format.toUpperCase()} • {Math.round(displayWidth * displayHeight / 1000)}KB (est.)
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ marginTop: 24 }}>
            <Button
              text="Edit Image"
              onPress={() => bottomSheetRef.current?.expand()}
              style={[buttonStyles.primary, { marginBottom: 12 }]}
            />
            <Button
              text="Save to Gallery"
              onPress={saveImage}
              style={[buttonStyles.success, { marginBottom: 12 }]}
            />
          </View>
        </ScrollView>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['60%', '90%']}
          enablePanDownToClose
        >
          <BottomSheetView style={commonStyles.bottomSheetContent}>
            {/* Tabs */}
            <View style={commonStyles.tabContainer}>
              {renderTabButton('resize', 'resize-outline', 'Resize')}
              {renderTabButton('crop', 'crop-outline', 'Crop')}
              {renderTabButton('convert', 'swap-horizontal-outline', 'Convert')}
            </View>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {activeTab === 'resize' && renderResizeContent()}
              {activeTab === 'crop' && renderCropContent()}
              {activeTab === 'convert' && renderConvertContent()}
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
