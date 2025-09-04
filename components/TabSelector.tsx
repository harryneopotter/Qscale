import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from './Icon';
import { commonStyles, colors } from '../styles/commonStyles';

export interface Tab {
  id: string;
  title: string;
  icon?: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  style?: ViewStyle;
  showIcons?: boolean;
}

const TabSelector = React.memo<TabSelectorProps>(({ 
  tabs, 
  activeTab, 
  onTabChange, 
  style,
  showIcons = false 
}) => {
  const handleTabPress = (tabId: string) => {
    if (tabId !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabChange(tabId);
    }
  };

  return (
    <View style={[commonStyles.tabContainer, style]} testID="tab-selector">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          testID={`tab-${tab.id}`}
          style={[
            commonStyles.tab,
            activeTab === tab.id && commonStyles.tabActive,
          ]}
          onPress={() => handleTabPress(tab.id)}
        >
          {showIcons && tab.icon && (
            <Icon 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? colors.white : colors.textSecondary} 
            />
          )}
          <Text
            style={[
              commonStyles.tabText,
              activeTab === tab.id && commonStyles.tabTextActive,
              showIcons && { marginTop: 4 },
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

TabSelector.displayName = 'TabSelector';

export default TabSelector;
