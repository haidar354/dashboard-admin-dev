# Mode Offline/Mock - Dashboard Admin Bakoelku

Dokumen ini menjelaskan cara menggunakan aplikasi dashboard admin tanpa API server yang aktif.

## Fitur Mode Offline

Aplikasi sudah dikonfigurasi untuk bekerja dalam mode offline dengan menggunakan:

1. **Mock Service Worker (MSW)** - Intercept semua API calls
2. **Mock Data** - Data dummy untuk semua halaman
3. **Fallback Authentication** - Login otomatis menggunakan mock jika API gagal

## Cara Login (Mode Offline)

Ketika API server mati, aplikasi akan otomatis menggunakan mock authentication. Gunakan kredensial berikut:

### Kredensial Login:

**Admin User:**

- Email: `admin@demo.com`
- Password: `admin`

**Client User:**

- Email: `client@demo.com`
- Password: `client`

## Mengaktifkan Mode Mock

Mode mock akan **otomatis aktif** secara default. Jika ingin menonaktifkan, set environment variable:

```bash
USE_MOCK=false
```

## Halaman yang Tersedia

Semua halaman admin sudah dikonfigurasi dengan mock data:

1. **Dashboard** - `/admin/dashboard`
2. **IAM (Identity & Access Management)**
   - Users - `/admin/iam/users`
   - Roles - `/admin/iam/roles`
3. **Tenant Management**
   - Companies - `/admin/tenant/companies`
   - Business Units - `/admin/tenant/business-units`
   - Outlets - `/admin/tenant/outlets`
4. **Billing**
   - Plans - `/admin/billing/plans`
   - Subscriptions - `/admin/billing/subscriptions`
   - Invoices - `/admin/billing/invoices`
   - Payments - `/admin/billing/payments`
5. **Support**
   - Tickets - `/admin/support/tickets`
   - Error Logs - `/admin/support/error-logs`
   - Monitoring - `/admin/support/monitoring`
6. **System Configuration**
   - Modules - `/admin/config/modules`
   - Features - `/admin/config/features`
   - Permissions - `/admin/config/permissions`
   - Plan Capabilities - `/admin/config/plan-capabilities`
   - Tenant Overrides - `/admin/config/tenant-overrides`

## Bagaimana Cara Kerjanya

### 1. Mock Service Worker (MSW)

- Intercept semua API requests
- Mengembalikan mock response berdasarkan handler yang sudah dikonfigurasi
- Aktif secara default, tidak perlu konfigurasi tambahan

### 2. Store dengan Mock Data

- Semua store admin sudah menggunakan mock data lokal
- Data disimpan dalam array JavaScript
- Perubahan data bersifat temporary (hilang saat refresh)

### 3. Authentication Fallback

- Jika API login gagal, otomatis menggunakan mock auth
- User tetap bisa login dan mengakses semua halaman
- Token disimpan di localStorage seperti biasa

## Catatan Penting

1. **Data Temporary**: Semua perubahan data (create, update, delete) hanya bersifat temporary. Data akan kembali ke default saat halaman di-refresh.

2. **MSW Service Worker**: Pastikan file `mockServiceWorker.js` ada di folder `public/`. File ini akan otomatis dibuat saat MSW dijalankan pertama kali.

3. **Console Warning**: Jika melihat warning tentang "API login failed, trying mock login" di console, itu normal dan menunjukkan bahwa fallback sedang bekerja.

## Troubleshooting

### Login tidak berhasil

- Pastikan menggunakan kredensial yang benar: `admin@demo.com` / `admin`
- Cek console browser untuk error messages
- Pastikan MSW sudah aktif (cek console untuk pesan "Mock Service Worker started")

### Halaman tidak bisa diakses

- Pastikan sudah login terlebih dahulu
- Cek localStorage apakah ada data `authStore`
- Cek console untuk error messages

### MSW tidak berfungsi

- Pastikan tidak ada environment variable `USE_MOCK=false`
- Hapus cache browser dan reload
- Cek apakah file `mockServiceWorker.js` ada di folder `public/`

## Development

Untuk mengembangkan atau mengubah mock data:

1. **Auth Data**: `src/plugins/fake-api/handlers/auth/db.ts`
2. **Admin Mock Data**:

   - IAM: `src/plugins/fake-api/handlers/admin/mockIamData.ts`
   - Dashboard: `src/plugins/fake-api/handlers/admin/mockDashboardData.ts`
   - Tenant: `src/plugins/fake-api/handlers/admin/mockTenantData.ts`
   - Billing: `src/plugins/fake-api/handlers/admin/mockBillingData.ts`
   - Support: `src/plugins/fake-api/handlers/admin/mockSupportData.ts`
   - System Config: `src/plugins/fake-api/handlers/admin/mockSystemConfigData.ts`

3. **API Handlers**: `src/plugins/fake-api/handlers/auth/index.ts`

## Support

Jika mengalami masalah, cek:

1. Console browser untuk error messages
2. Network tab untuk melihat request yang gagal
3. Application tab > Local Storage untuk melihat data yang tersimpan
