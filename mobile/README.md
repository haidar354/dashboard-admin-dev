# BakoelKu Mobile App

Aplikasi mobile React Native/Expo untuk admin dashboard BakoelKu.

## 📱 Fitur

### Autentikasi
- ✅ Login dengan Email & Password
- ✅ Auto refresh token
- ✅ Secure storage untuk credentials

### Dashboard
- ✅ Statistik overview (Total Tenants, Revenue, Tickets, Errors)
- ✅ Line Chart - Pertumbuhan Tenant
- ✅ Bar Chart - Revenue vs Target
- ✅ Donut Chart - Status Subscription
- ✅ Recent Activities
- ✅ Pull-to-refresh

### IAM (Identity & Access Management)
- ✅ Users - CRUD dengan pagination & search
- ✅ Roles - List dengan pagination

### Tenant Management
- ✅ Companies - List & Search
- ✅ Business Units - List & Search
- ✅ Outlets - List & Search

### Billing
- ✅ Plans - List subscription plans
- ✅ Subscriptions - List active subscriptions

### Support
- ✅ Tickets - List support tickets dengan priority & status

### Settings
- ✅ Dark Mode / Light Mode toggle
- ✅ User Profile
- ✅ Menu navigasi ke fitur lainnya
- ✅ Logout

## 🎨 Desain

- **Warna Utama**: #1976D2 (Biru)
- **Style**: Modern minimalis dengan card-based layout
- **Dark Mode**: Fully supported
- **Responsive**: Mendukung berbagai ukuran layar

## 🛠️ Tech Stack

- **Framework**: Expo SDK 52+
- **Language**: TypeScript
- **Navigation**: React Navigation 6 (Bottom Tabs + Stack)
- **State Management**: Zustand
- **API Client**: Axios dengan refresh token interceptor
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Charts**: React Native SVG (Custom charts)
- **Storage**: Expo Secure Store

## 📦 Instalasi

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## 🔧 Konfigurasi

### API Base URL
Edit file `src/config/api.ts`:

```typescript
export const API_BASE_URL = 'https://api-dev.bakoelku.com';
```

## 📲 Build APK (Android)

### Metode 1: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login ke Expo account
eas login

# Konfigurasi EAS Build
eas build:configure

# Build APK untuk Android
eas build --platform android --profile preview

# Atau build AAB untuk Play Store
eas build --platform android --profile production
```

### Metode 2: Local Build (Tanpa EAS)

```bash
# Install dependencies
yarn install

# Generate native Android project
npx expo prebuild --platform android

# Build APK menggunakan Gradle
cd android
./gradlew assembleRelease

# APK akan berada di:
# android/app/build/outputs/apk/release/app-release.apk
```

### Metode 3: Expo Build (Legacy)

```bash
# Build APK
expo build:android -t apk

# Build AAB
expo build:android -t app-bundle
```

## 📲 Build iOS

### Prerequisites
- macOS dengan Xcode terinstall
- Apple Developer Account

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Buka di Xcode
cd ios && open BakoelKuMobile.xcworkspace

# Atau menggunakan EAS
eas build --platform ios
```

## 🔑 Signing (Android)

### Generate Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore bakoelku.keystore -alias bakoelku -keyalg RSA -keysize 2048 -validity 10000
```

### Konfigurasi di `android/app/build.gradle`

```gradle
android {
    signingConfigs {
        release {
            storeFile file('bakoelku.keystore')
            storePassword 'your-store-password'
            keyAlias 'bakoelku'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 📁 Struktur Project

```
mobile/
├── App.tsx                 # Entry point
├── app.json               # Expo config
├── tailwind.config.js     # Tailwind/NativeWind config
├── src/
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   └── charts/        # Chart components
│   ├── config/
│   │   ├── api.ts         # API endpoints
│   │   └── theme.ts       # Theme colors & spacing
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── iam/
│   │   ├── tenant/
│   │   ├── billing/
│   │   ├── support/
│   │   └── settings/
│   ├── services/          # API services
│   └── stores/            # Zustand stores
└── assets/
```

## 🔒 Environment Variables

Buat file `eas.json` untuk konfigurasi build:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## 📝 Notes

- Pastikan API backend sudah running dan accessible
- Untuk testing di emulator, gunakan `10.0.2.2` untuk localhost Android
- Dark mode mengikuti pengaturan sistem atau dapat diubah manual

## 🐛 Troubleshooting

### Error: Unable to resolve module
```bash
# Clear cache dan reinstall
rm -rf node_modules
yarn install
npx expo start --clear
```

### Android build failed
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

## 📄 License

Copyright © 2024 BakoelKu. All rights reserved.
