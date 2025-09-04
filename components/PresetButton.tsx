import React, { useRef } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { commonStyles, colors } from '../styles/commonStyles';

interface PresetButtonProps {
  title: string;
  subtitle?: string;
  isActive?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const PresetButton = React.memo<PresetButtonProps>(({ 
  title, 
  subtitle, 
  isActive = false, 
  onPress, 
  style, 
  textStyle,
  disabled = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      testID="preset-button"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          commonStyles.presetButton,
          isActive && commonStyles.presetButtonActive,
          disabled && { opacity: 0.5 },
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
      <Text
        style={[
          commonStyles.presetButtonText,
          isActive && commonStyles.presetButtonTextActive,
          textStyle,
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            commonStyles.presetButtonText,
            isActive && commonStyles.presetButtonTextActive,
            { fontSize: 10, opacity: 0.7 },
            textStyle,
          ]}
        >
          {subtitle}
        </Text>
      )}
      </Animated.View>
    </TouchableOpacity>
  );
});

PresetButton.displayName = 'PresetButton';

export default PresetButton;
