# QScale

Scale. Crop. Convert. Effortlessly.

QScale is a cross-platform image utility built with Expo + React Native. It lets you quickly resize (with presets), crop (with aspect ratios), and convert (PNG/JPEG with quality) images, then save, share, or export them — on Android, iOS, and Web (with PWA support).

## Features
- Import from gallery or take a photo
- Resize
  - Pixels or percentage modes
  - Social and common size presets
  - Aspect ratio lock
- Crop
  - Common aspect ratios (1:1, 4:3, 16:9, etc.)
  - Manual X/Y/Width/Height
  - Optional grid overlay
- Convert
  - JPEG or PNG
  - Adjustable JPEG quality
  - Background color aid when converting transparent PNG → JPEG
- Export/Share
  - Save to gallery (native)
  - Download (web)
  - System share sheet
- Edit History and quick access to recent files
- Animated splash screen and polished dark UI theme

## Tech Stack
- Expo 53, React 19, React Native 0.79
- Expo Router for navigation
- TypeScript with strict mode
- AsyncStorage for history
- Workbox for PWA service worker (Web export)
- ESLint configured for Expo + TS + React

## Project Structure
- app/
  - index.tsx – Home (import, quick actions, recent files)
  - editor.tsx – Resize, Crop, Convert, Undo/Redo, Save/Export
  - export.tsx – Preview, save, share
  - history.tsx – Recent edit history
  - _layout.tsx – Root layout with StatusBar and navigation stack
- components/ – Button, Icon, SplashScreen
- styles/ – commonStyles.ts theme and shared styles
- utils/errorLogger.ts – enhanced runtime error reporting (web-aware)
- index.ts – Expo Router entry
- workbox-config.js – service worker generation for web export
- metro.config.js – Metro cache store
- tsconfig.json, babel.config.js, .eslintrc.js – tooling configuration

## Getting Started
Prerequisites:
- Node.js 18+ (recommended)
- Yarn (preferred for this project)
- Android Studio / Xcode if targeting devices/simulators

Install dependencies:
- yarn install

Run the app (these commands start Expo and will take over a terminal session):
- yarn dev – start with tunnel
- yarn android – start in Android
- yarn ios – start in iOS
- yarn web – start in Web

Build for Web (static export + PWA service worker):
- yarn build:web

Lint:
- yarn lint

Notes:
- On native platforms, the app requests camera/library permissions as needed.
- Large images may be limited by device memory.
- Babel path alias '@style' currently points to './style' while the folder is 'styles'. Imports in this repo use relative paths; if you start using the alias, consider updating it to '@styles': './styles'.

## Configuration Highlights
- TypeScript: strict mode, '@/*' path alias to project root
- Babel module-resolver aliases ('@', '@components', '@style' etc.)
- Workbox config pre-caches assets and uses NetworkFirst strategy by default
- ESLint tuned for Expo + React + TypeScript

## Roadmap
- CI (lint on PR) via GitHub Actions
- Unit tests (Jest/React Native Testing Library)
- E2E tests (Detox) for mobile flows
- Improved PWA install experience

## License
Private/Proprietary (UNLICENSED). All rights reserved. No redistribution, modification, or use permitted beyond authorized collaborators and environments. We may switch to MIT once the project is ready for open source.

