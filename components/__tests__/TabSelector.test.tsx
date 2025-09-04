import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TabSelector from '../TabSelector';

describe('TabSelector Component', () => {
  const mockTabs = [
    { id: 'tab1', title: 'Tab 1' },
    { id: 'tab2', title: 'Tab 2' },
    { id: 'tab3', title: 'Tab 3' },
  ];

  const mockTabsWithIcons = [
    { id: 'resize', title: 'Resize', icon: 'resize-outline' },
    { id: 'crop', title: 'Crop', icon: 'crop-outline' },
  ];

  it('renders all tabs correctly', () => {
    const { getByText } = render(
      <TabSelector 
        tabs={mockTabs} 
        activeTab="tab1" 
        onTabChange={() => {}} 
      />
    );
    
    expect(getByText('Tab 1')).toBeTruthy();
    expect(getByText('Tab 2')).toBeTruthy();
    expect(getByText('Tab 3')).toBeTruthy();
  });

  it('shows active tab correctly', () => {
    const { getByTestId } = render(
      <TabSelector 
        tabs={mockTabs} 
        activeTab="tab2" 
        onTabChange={() => {}} 
      />
    );
    
    const activeTab = getByTestId('tab-tab2');
    expect(activeTab.props.style.elevation).toBe(4);
    expect(activeTab.props.style.backgroundColor).toBe('#00E5FF');
  });

  it('calls onTabChange when tab is pressed', () => {
    const mockOnTabChange = jest.fn();
    const { getByTestId } = render(
      <TabSelector 
        tabs={mockTabs} 
        activeTab="tab1" 
        onTabChange={mockOnTabChange} 
      />
    );
    
    fireEvent.press(getByTestId('tab-tab2'));
    expect(mockOnTabChange).toHaveBeenCalledWith('tab2');
  });

  it('does not call onTabChange when active tab is pressed', () => {
    const mockOnTabChange = jest.fn();
    const { getByTestId } = render(
      <TabSelector 
        tabs={mockTabs} 
        activeTab="tab1" 
        onTabChange={mockOnTabChange} 
      />
    );
    
    fireEvent.press(getByTestId('tab-tab1'));
    expect(mockOnTabChange).not.toHaveBeenCalled();
  });

  it('renders icons when showIcons is true', () => {
    const { getByTestId } = render(
      <TabSelector 
        tabs={mockTabsWithIcons} 
        activeTab="resize" 
        onTabChange={() => {}} 
        showIcons={true}
      />
    );
    
    expect(getByTestId('icon-resize-outline')).toBeTruthy();
    expect(getByTestId('icon-crop-outline')).toBeTruthy();
  });
});
