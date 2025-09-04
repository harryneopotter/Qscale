import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with text', () => {
    const { getByText } = render(
      <Button text="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button text="Click Me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button text="Disabled Button" onPress={mockOnPress} disabled={true} />
    );
    
    const button = getByTestId('button');
    
    // Test that onPress is not called when disabled
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    
    // Test that the animated view has disabled styling
    const animatedView = button.children[0];
    expect(animatedView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 0.6 })
      ])
    );
  });

  it('applies custom styles correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Button text="Styled Button" onPress={() => {}} style={customStyle} />
    );
    
    const button = getByTestId('button');
    const animatedView = button.children[0];
    
    // Test that custom style is applied to the animated view
    expect(animatedView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });
});
