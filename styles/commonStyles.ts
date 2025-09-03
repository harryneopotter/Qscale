
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#00E5FF',      // Bright cyan accent (matching Q Panda)
  secondary: '#1DE9B6',    // Teal accent  
  accent: '#40C4FF',       // Light blue accent
  background: '#0A0E1A',   // Deep navy background (matching Q Panda)
  backgroundAlt: '#0F1419', // Slightly lighter navy
  surface: '#1A1F2E',      // Card/surface color (dark blue-gray)
  text: '#FFFFFF',         // White text
  textSecondary: '#B0BEC5', // Light blue-gray text
  textTertiary: '#78909C', // Darker blue-gray text
  border: '#263238',       // Dark blue-gray border
  success: '#00E676',      // Bright green
  warning: '#FFB74D',      // Orange
  error: '#FF5252',        // Red
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  // Additional colors for the Q Panda theme
  glow: '#00E5FF',         // Cyan glow effect
  cardBackground: '#141B2D', // Card background with slight blue tint
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    boxShadow: '0px 4px 20px rgba(0, 229, 255, 0.3)',
    elevation: 8,
  },
  secondary: {
    backgroundColor: colors.surface,
    alignSelf: 'center',
    width: '100%',
  },
  success: {
    backgroundColor: colors.success,
    alignSelf: 'center',
    width: '100%',
  },
  warning: {
    backgroundColor: colors.warning,
    alignSelf: 'center',
    width: '100%',
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  textTertiary: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    marginBottom: 4,
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 32,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.4)',
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: 'Inter_400Regular',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    boxShadow: '0px 2px 10px rgba(0, 229, 255, 0.3)',
    elevation: 4,
  },
  presetButtonText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Inter_500Medium',
  },
  presetButtonTextActive: {
    color: colors.black,
    fontWeight: '600',
  },
  bottomSheetContent: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: colors.cardBackground,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    boxShadow: '0px 2px 10px rgba(0, 229, 255, 0.3)',
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  tabTextActive: {
    color: colors.black,
    fontWeight: '600',
  },
});
