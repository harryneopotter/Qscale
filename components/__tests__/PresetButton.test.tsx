import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PresetButton from '../PresetButton';

describe('PresetButton Component', () => {
  it('renders correctly with title and subtitle', () => {
    const { getByText } = render(
      <PresetButton 
        title="Instagram Square" 
        subtitle="1080×1080"
        onPress={() => {}} 
      />
    );
    
    expect(getByText('Instagram Square')).toBeTruthy();
    expect(getByText('1080×1080')).toBeTruthy();
  });

  it('renders without subtitle when not provided', () => {
    const { getByText, queryByText } = render(
      <PresetButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
    expect(queryByText('subtitle')).toBeFalsy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <PresetButton title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('preset-button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows active state correctly', () => {
    const { getByTestId } = render(
      <PresetButton title="Active Button" isActive={true} onPress={() => {}} />
    );
    
    const button = getByTestId('preset-button');
    // The TouchableOpacity now wraps an Animated.View, so we need to check children
    const animatedView = button.children[0];
    expect(animatedView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ elevation: 4, backgroundColor: '#00E5FF' })
      ])
    );
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <PresetButton title="Disabled Button" disabled={true} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('preset-button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
