# Ringkasan Perubahan - Mode Offline/Mock

Dokumen ini menjelaskan semua perubahan yang dilakukan untuk membuat aplikasi dashboard admin bisa berjalan tanpa API server.

## Perubahan yang Dilakukan

### 1. Modifikasi Fake API (Mock Service Worker)

**File**: `src/plugins/fake-api/index.ts`

- Mengubah kondisi aktivasi MSW agar selalu aktif (tidak hanya di DEV mode)
- Menambahkan environment variable `USE_MOCK` untuk kontrol manual
- Menambahkan console logging untuk monitoring

### 2. Perbaikan Auth Handlers

**File**: `src/plugins/fake-api/handlers/auth/index.ts`

- Menambahkan handler untuk endpoint `*/platform/auth/login` (pattern matching untuk semua baseURL)
- Menambahkan handler untuk `*/auth/me` (get current user)
- Menambahkan handler untuk `*/auth/refresh-token` (refresh token)
- Menambahkan handler untuk `*/auth/logout`
- Membuat helper functions untuk create login response dan user data
- Handler sekarang bisa intercept URL dengan pattern wildcard `*/path`

### 3. Fallback Mock Authentication di AuthStore

**File**: `src/stores/authStore.ts`

- Menambahkan import `db` dari `@db/auth/db`
- Menambahkan method `mockLogin()` untuk login tanpa API
- Memodifikasi method `login()` untuk fallback ke mock login jika API gagal
- Memodifikasi method `getMe()` untuk fallback ke mock user jika API gagal
- Memodifikasi method `refreshToken()` untuk fallback ke mock refresh jika API gagal
- Semua fallback bekerja secara otomatis tanpa perlu konfigurasi tambahan

### 4. Perbaikan Import showToast di Admin Stores

**Files**:

- `src/stores/admin/userStore.ts`
- `src/stores/admin/companyStore.ts`
- `src/stores/admin/billingStore.ts`
- `src/stores/admin/supportStore.ts`
- `src/stores/admin/systemConfigStore.ts`

Menambahkan import `showToast` dari `@/utils/toaster` di semua store admin yang menggunakannya.

### 5. Dokumentasi

**Files**:

- `MOCK_MODE_README.md` - Dokumentasi lengkap penggunaan mode offline
- `CHANGES_SUMMARY.md` - Ringkasan perubahan ini

## Fitur yang Bekerja Tanpa API

✅ **Authentication**

- Login dengan mock credentials
- Auto-login jika API gagal
- Token management
- Refresh token

✅ **Semua Halaman Admin**

- Dashboard dengan statistik mock
- IAM (Users & Roles)
- Tenant Management (Companies, Business Units, Outlets)
- Billing (Plans, Subscriptions, Invoices, Payments)
- Support (Tickets, Error Logs, Monitoring)
- System Configuration (Modules, Features, Permissions, dll)

✅ **CRUD Operations**

- Semua operasi Create, Read, Update, Delete bekerja dengan mock data
- Data bersifat temporary (kembali ke default saat refresh)

## Cara Menggunakan

### Login

Gunakan kredensial berikut untuk login:

- **Email**: `admin@demo.com`
- **Password**: `admin`

Aplikasi akan otomatis menggunakan mock auth jika API server tidak tersedia.

### Menonaktifkan Mode Mock

Jika ingin menggunakan API real, set environment variable:

```bash
USE_MOCK=false
```

## Catatan Penting

1. **Data Temporary**: Perubahan data hanya bersifat temporary dan akan hilang saat refresh halaman
2. **MSW Service Worker**: Pastikan file `mockServiceWorker.js` ada di folder `public/`
3. **Router Guards**: Router guards hanya mengecek localStorage, tidak memanggil API, jadi tidak ada masalah

## Testing

Untuk memastikan semua bekerja:

1. Matikan API server atau set baseURL ke URL yang tidak valid
2. Jalankan aplikasi dengan `npm run dev`
3. Login dengan kredensial mock
4. Akses semua halaman admin - seharusnya semua bisa diakses dan menampilkan data mock

## File yang Dimodifikasi

1. `src/plugins/fake-api/index.ts` - MSW configuration
2. `src/plugins/fake-api/handlers/auth/index.ts` - Auth handlers
3. `src/stores/authStore.ts` - Fallback mock auth
4. `src/stores/admin/userStore.ts` - Import showToast
5. `src/stores/admin/companyStore.ts` - Import showToast
6. `src/stores/admin/billingStore.ts` - Import showToast
7. `src/stores/admin/supportStore.ts` - Import showToast
8. `src/stores/admin/systemConfigStore.ts` - Import showToast

## File yang Dibuat

1. `MOCK_MODE_README.md` - Dokumentasi mode offline
2. `CHANGES_SUMMARY.md` - Ringkasan perubahan ini
