
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';

interface HistoryItem {
  id: string;
  uri: string;
  name: string;
  timestamp: number;
  operation: string;
}

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentFiles');
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recentFiles');
              setHistoryItems([]);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          },
        },
      ]
    );
  };

  const openImage = (item: HistoryItem) => {
    router.push({
      pathname: '/editor',
      params: { imageUri: item.uri }
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'resized': return 'resize-outline';
      case 'cropped': return 'crop-outline';
      case 'converted': return 'swap-horizontal-outline';
      case 'captured': return 'camera-outline';
      default: return 'image-outline';
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'resized': return colors.primary;
      case 'cropped': return colors.secondary;
      case 'converted': return colors.accent;
      case 'captured': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={[commonStyles.card, {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginVertical: 8,
      }]}
      onPress={() => openImage(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={{
          width: 60,
          height: 60,
          borderRadius: 8,
          marginRight: 16,
        }}
        resizeMode="cover"
      />
      
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 4 }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Icon 
            name={getOperationIcon(item.operation) as any} 
            size={16} 
            color={getOperationColor(item.operation)} 
          />
          <Text style={[commonStyles.textSecondary, { marginLeft: 8, textAlign: 'left' }]}>
            {item.operation.charAt(0).toUpperCase() + item.operation.slice(1)}
          </Text>
        </View>
        <Text style={[commonStyles.textTertiary, { textAlign: 'left' }]}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>QScale History</Text>
        {historyItems.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Icon name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {historyItems.length === 0 ? (
        <View style={commonStyles.centerContent}>
          <Icon name="time-outline" size={80} color={colors.textSecondary} />
          <Text style={[commonStyles.subtitle, { marginTop: 24, marginBottom: 8 }]}>
            No History Yet
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 32 }]}>
            Your recent edits will appear here
          </Text>
          <Button
            text="Start Editing"
            onPress={() => router.push('/')}
            style={buttonStyles.primary}
          />
        </View>
      ) : (
        <FlatList
          data={historyItems}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
