# NomNomzBot Dashboard

A universal Twitch bot management app built with Expo and React Native. Manage your chat commands, moderation rules, loyalty points, stream timers, music queue, and more — from web, iOS, Android, or tablet, all from a single codebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~55 / [React Native](https://reactnative.dev) ~0.79 |
| Language | TypeScript ^5.6 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) ~5 (file-based) |
| Styling | [NativeWind](https://www.nativewind.dev) 5 + Tailwind CSS ^4 |
| State | [Zustand](https://zustand-demo.pmnd.rs) ^5 |
| Server State | [TanStack Query](https://tanstack.com/query) ^5 |
| Realtime | [SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction) (@microsoft/signalr ^8) |
| Auth | Twitch OAuth via `expo-auth-session` |
| Forms | React Hook Form + Zod |
| i18n | i18next ^24 + react-i18next + expo-localization |
| Icons | Lucide React Native |

## Supported Platforms

- **Web** — Metro bundler, server-side rendering
- **iOS** — iPhone and iPad (tablet layout supported)
- **Android** — Phone and tablet

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Expo CLI](https://docs.expo.dev/more/expo-cli/): `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) app on your device for physical device testing
- A running [NomNomzBot backend](https://github.com/NoMercyLabs/nomnomzbot) instance

For iOS simulator: Xcode 15+
For Android emulator: Android Studio with an emulator configured

## Quick Start

```bash
# Clone the repo
git clone https://github.com/NoMercyLabs/nomnomzbot-app.git
cd nomnomzbot-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Start the dev server
npx expo start
```

Press `w` for web, `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Development Commands

```bash
npm start               # Start Expo dev server (all platforms)
npm run web             # Start targeting web only
npm run ios             # Start targeting iOS simulator
npm run android         # Start targeting Android emulator
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript type-check (no emit)
npm test                # Run Jest test suite
```

## Project Structure

```
nomnomzbot-app/
├── app/                        # Expo Router file-based routes
│   ├── (auth)/                 # Auth screens (login, register)
│   ├── (dashboard)/            # Main app screens (requires auth)
│   ├── (admin)/                # Admin-only screens
│   ├── (public)/               # Unauthenticated public pages
│   ├── callback.tsx            # OAuth deep-link callback handler
│   └── _layout.tsx             # Root layout (providers, theming)
│
├── features/                   # Feature modules (self-contained)
│   ├── auth/                   # Authentication logic & screens
│   ├── chat/                   # Chat management
│   ├── commands/               # Custom bot commands
│   ├── moderation/             # Moderation rules & filters
│   ├── rewards/                # Channel point rewards
│   ├── timers/                 # Stream timers
│   ├── music/                  # Music queue
│   ├── stream/                 # Stream info & overlays
│   ├── widgets/                # Dashboard widgets
│   ├── settings/               # User & bot settings
│   ├── integrations/           # Third-party integrations
│   ├── permissions/            # Permission management
│   ├── pipelines/              # Automation pipelines
│   ├── community/              # Community & viewer tools
│   ├── billing/                # Subscription & billing
│   └── my-data/                # User data management
│
├── stores/                     # Zustand global state stores
│   ├── useAuthStore.ts         # Auth state & tokens
│   ├── useAppStore.ts          # App-level state
│   ├── useChannelStore.ts      # Active channel state
│   ├── useNotificationStore.ts # Notification queue
│   └── useThemeStore.ts        # Theme preferences
│
├── hooks/                      # Shared React hooks
│   ├── useSignalR.ts           # SignalR connection management
│   ├── useRealtimeChannel.ts   # Per-channel realtime events
│   ├── useApi.ts               # Typed API client hook
│   ├── useAuth.ts              # Auth state & actions
│   ├── useBreakpoint.ts        # Responsive breakpoint detection
│   ├── usePlatform.ts          # Platform detection helpers
│   └── ...
│
├── lib/                        # Core infrastructure
│   ├── api/                    # Axios client, interceptors, 401 handling
│   ├── signalr/                # SignalR client setup & hub management
│   ├── i18n/                   # i18next configuration & locale loading
│   ├── storage/                # Platform-aware secure storage (SecureStore/localStorage)
│   ├── theme/                  # Theme tokens & NativeWind config
│   └── utils/                  # Shared utility functions
│
├── components/                 # Shared UI components
│   ├── ui/                     # Base components (Button, Input, Card, etc.)
│   ├── layout/                 # Layout primitives (Screen, Container, etc.)
│   ├── compound/               # Composed components
│   ├── feedback/               # Toast, alerts, loading states
│   ├── providers/              # React context providers
│   └── ErrorBoundary.tsx       # Top-level error boundary
│
├── locales/                    # i18n translation files (per feature, per locale)
├── types/                      # Shared TypeScript type declarations
├── assets/                     # Images, fonts, icons
├── app.config.ts               # Expo app configuration
├── tailwind.config.ts          # Tailwind / NativeWind config
└── tsconfig.json               # TypeScript config
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Base URL of your NomNomzBot backend (no trailing slash, no /api suffix)
EXPO_PUBLIC_API_URL=http://localhost:5000

# Your Expo project ID from expo.dev (required for push notifications and EAS)
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

Additional variables used in `app.config.ts` (set in your EAS build profile or CI environment):

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_TWITCH_CLIENT_ID` | Twitch application client ID for OAuth |
| `EAS_PROJECT_ID` | EAS project ID (used in `eas.json`) |
| `APP_VARIANT` | Build variant: `development`, `preview`, or production (unset) |

> All `EXPO_PUBLIC_*` variables are inlined at build time and visible in the client bundle. Never put secrets in these variables.

## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

For OTA (over-the-air) updates without a full app store release:

```bash
eas update --branch production --message "Fix: ..."
```

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch from `master`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes. Keep commits focused and atomic.

3. Ensure the project builds and passes checks:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

4. Open a pull request against `master` with a clear description of what changed and why.

**Code style:**
- TypeScript strict mode — no `any` unless unavoidable
- NativeWind utility classes for all styling (no `StyleSheet.create`)
- Feature code lives in `features/`, shared code in `components/`, `hooks/`, or `lib/`
- Translations go in `locales/<locale>/<feature>.json` — no hardcoded strings in UI

## License

[AGPL-3.0](LICENSE) — see the LICENSE file for details.

This means: you can use, modify, and distribute this software freely, but any modifications you deploy as a network service must also be made available under AGPL-3.0.
