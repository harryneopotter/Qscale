# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: QScale — Expo + React Native app for resizing, cropping, and converting images with Web (PWA) support.

Common commands
- Prereqs: Node >=18, Yarn (preferred).
- Install dependencies:
  - yarn install
- Development (Expo dev server; these take over the terminal — run them in a separate PowerShell window/tab to avoid hijacking the Warp session):
  - Start with tunnel: yarn dev
  - Android simulator/device: yarn android
  - iOS simulator/device: yarn ios
  - Web: yarn web
- Lint:
  - yarn lint
- Tests:
  - Run all tests: yarn test
  - Run tests in watch mode: yarn test:watch
  - Run tests with coverage: yarn test:coverage
  - Run a single test file: yarn test Button.test.tsx
  - Run tests matching pattern: yarn test --testNamePattern="Button Component"
- Web build (static export + PWA service worker):
  - yarn build:web
  - Notes: expo export outputs to dist/, then Workbox generates dist/sw.js using workbox-config.js
- Android prebuild (generates native project files; does not produce an APK):
  - yarn build:android

High-level architecture
- Entry and routing
  - index.ts loads expo-router/entry.
  - app/_layout.tsx defines the navigation Stack (index, editor, history, export), loads Inter fonts, controls the splash screen, sets a light StatusBar, wraps with SafeAreaProvider, and calls utils/errorLogger.setupErrorLogging() to enhance runtime error reporting (especially on web).

- Screens (app/)
  - index.tsx (Home)
    - Imports/selects images via expo-image-picker (gallery or camera), shows three quick actions (resize, crop, convert), and maintains “recent files” in AsyncStorage under the key recentFiles. Navigates to the editor with router.push.
  - editor.tsx (Editor)
    - Core image operations using expo-image-manipulator: resize (pixels/percent with aspect lock and presets), crop (common aspect ratios, manual region), and convert (PNG/JPEG with quality and optional background color consideration when converting to JPEG). Tracks in-memory edit history for undo/redo and routes to export after each operation. Uses @gorhom/bottom-sheet for the tool UI and Haptics for feedback.
  - export.tsx (Export)
    - Preview the edited image and its dimensions/size (via expo-file-system). Saves to gallery on native using expo-media-library or forces a download on web. Supports system share (Share API on native, Web Share API on web when available).
  - history.tsx (History)
    - Reads the recentFiles list from AsyncStorage and links back into the editor for re-opening prior images. Supports clearing history.

- Components and styling
  - components/Button.tsx, components/Icon.tsx provide basic UI primitives with React.memo optimization and press animations.
  - components/PresetButton.tsx: Reusable preset button with haptic feedback, active states, and press animations.
  - components/TabSelector.tsx: Generic tab component supporting icons, consistent styling, and memoized handlers.
  - components/LoadingOverlay.tsx: Blur background loading overlay with progress support and smooth animations.
  - components/SplashScreen.tsx shows the animated app splash.
  - styles/commonStyles.ts centralizes theme colors, text and layout styles, and shared patterns (e.g., card, tab, button variants). Some styles include both React Native elevation and web-friendly boxShadow for PWA builds.

- Constants and types
  - constants/imagePresets.ts: Social media presets (Instagram, Facebook, YouTube, etc.), common resolutions (HD, 4K), and crop ratios with proper TypeScript interfaces.
  - types/image.ts: Shared TypeScript interfaces for ImageInfo, EditHistory, and union types for ActiveTab, ResizeMode, CropMode, ImageFormat.

- Utilities and tooling
  - utils/errorLogger.ts sets up window.onerror and unhandledrejection handlers for web, de-duplicates bursty errors, and can post messages to a parent window for integrated logging. It's wired up in app/_layout.tsx via setupErrorLogging().
  - babel.config.js: module-resolver aliases '@' → './', '@components' → './components', '@styles' → './styles', '@hooks' → './hooks', '@types' → './types', '@constants' → './constants'.
  - tsconfig.json: strict TypeScript, baseUrl '.', and path aliases for '@/*', '@components/*', '@styles/*', '@hooks/*', '@types/*', '@constants/*'.
  - jest.config.js: Jest preset '@testing-library/react-native' with React Native Testing Library setup, module name mapping for aliases, and coverage collection from app/, components/, utils/.
  - metro.config.js: caches Metro in node_modules/.cache/metro via FileStore.
  - workbox-config.js: NetworkFirst runtimeCaching for all routes; skipWaiting and clientsClaim enabled. Generated service worker lives at dist/sw.js after yarn build:web.

Important notes and gotchas
- Package manager: Yarn is preferred (README).
- Long-running commands: Expo dev server commands (yarn dev/android/ios/web) take over the terminal; start them in a separate PowerShell window/tab rather than within Warp's active session, per user preference to avoid terminal hijacking.
- Path aliases: Both Babel and TypeScript are configured with consistent aliases: '@styles' for './styles', '@components' for './components', etc. Current imports are mostly relative paths, but aliases are available if needed.
- Testing: Jest with React Native Testing Library is set up. Tests are located in __tests__ folders or files ending with .test.tsx/.spec.tsx.
- Performance: Components use React.memo to prevent unnecessary re-renders. Editor uses useMemo for expensive calculations (display dimensions, file size estimates) and useCallback for event handlers. Images have loading states and caching optimizations.

