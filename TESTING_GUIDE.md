# Panduan Testing - Mode Offline

Dokumen ini menjelaskan cara test aplikasi dalam mode offline tanpa API server.

## Persiapan Testing

1. **Pastikan MSW aktif**

   - Buka browser console
   - Cari pesan: "✅ Mock Service Worker started - API calls will be intercepted"
   - Jika tidak muncul, pastikan tidak ada environment variable `USE_MOCK=false`

2. **Clear localStorage (opsional)**
   - Buka DevTools > Application > Local Storage
   - Hapus semua data atau hanya `authStore` jika ingin test login dari awal

## Test Login

### Test Case 1: Login dengan Mock Credentials

**Steps:**

1. Buka aplikasi di browser
2. Masuk ke halaman login (`/login`)
3. Input credentials:
   - Email: `admin@demo.com`
   - Password: `admin`
4. Klik tombol "Login"

**Expected Result:**

- ✅ Login berhasil
- ✅ Redirect ke dashboard atau halaman yang diminta
- ✅ Toast notification muncul: "Login berhasil (Mode Offline)" atau "Selamat datang [nama]"
- ✅ Console tidak ada error
- ✅ LocalStorage memiliki data `authStore` dengan `isLogin: true`

### Test Case 2: Login dengan API Server Mati

**Steps:**

1. Pastikan API server tidak aktif atau baseURL salah
2. Buka aplikasi di browser
3. Masuk ke halaman login
4. Input credentials: `admin@demo.com` / `admin`
5. Klik tombol "Login"

**Expected Result:**

- ✅ Login tetap berhasil (fallback ke mock)
- ✅ Console menampilkan warning: "API login failed, trying mock login"
- ✅ Toast notification: "Login berhasil (Mode Offline)"
- ✅ Redirect berhasil

### Test Case 3: Login dengan Credentials Salah

**Steps:**

1. Buka halaman login
2. Input credentials yang salah
3. Klik tombol "Login"

**Expected Result:**

- ❌ Login gagal
- ❌ Toast error muncul: "Invalid email or password"
- ❌ Tidak redirect
- ❌ Tetap di halaman login

## Test Navigation & Router Guards

### Test Case 4: Akses Halaman Tanpa Login

**Steps:**

1. Clear localStorage (hapus `authStore`)
2. Refresh halaman
3. Coba akses halaman admin langsung (misal: `/admin/dashboard`)

**Expected Result:**

- ✅ Redirect ke halaman login
- ✅ URL query parameter `to` berisi path yang diminta
- ✅ Setelah login, redirect ke halaman yang diminta

### Test Case 5: Akses Halaman Setelah Login

**Steps:**

1. Login dengan credentials yang benar
2. Navigasi ke berbagai halaman admin:
   - `/admin/dashboard`
   - `/admin/iam/users`
   - `/admin/iam/roles`
   - `/admin/tenant/companies`
   - `/admin/billing/plans`
   - `/admin/support/tickets`
   - `/admin/config/modules`

**Expected Result:**

- ✅ Semua halaman bisa diakses
- ✅ Tidak ada redirect ke login atau not-authorized
- ✅ Data mock ditampilkan dengan benar
- ✅ Tidak ada error di console

### Test Case 6: Router Guards dengan Abilities

**Steps:**

1. Login dengan `admin@demo.com` (memiliki ability 'all')
2. Coba akses halaman yang memerlukan permission `{ action: 'manage', subject: 'default' }`

**Expected Result:**

- ✅ Bisa akses semua halaman admin
- ✅ Router guards tidak block akses
- ✅ `canNavigate()` return `true` untuk semua halaman admin

## Test Halaman Admin

### Test Case 7: Dashboard

**Steps:**

1. Login
2. Akses `/admin/dashboard`

**Expected Result:**

- ✅ Halaman load tanpa error
- ✅ Statistik cards ditampilkan (Total Tenants, Revenue, Tickets, Errors)
- ✅ Charts ditampilkan (Tenant Growth, Revenue, Subscription Status)
- ✅ Recent Activities ditampilkan
- ✅ Loading state bekerja dengan benar

### Test Case 8: IAM - Users

**Steps:**

1. Login
2. Akses `/admin/iam/users`

**Expected Result:**

- ✅ List users ditampilkan
- ✅ Search berfungsi
- ✅ Pagination bekerja
- ✅ Bisa create, edit, delete user (data temporary)
- ✅ Dialog form muncul dengan benar

### Test Case 9: Tenant - Companies

**Steps:**

1. Login
2. Akses `/admin/tenant/companies`

**Expected Result:**

- ✅ List companies ditampilkan
- ✅ Filter by status dan plan bekerja
- ✅ Search berfungsi
- ✅ Bisa suspend, resume, delete company
- ✅ Data mock ditampilkan dengan benar

### Test Case 10: Billing - Plans

**Steps:**

1. Login
2. Akses `/admin/billing/plans`

**Expected Result:**

- ✅ List plans ditampilkan
- ✅ Bisa create, edit plan
- ✅ Form validation bekerja
- ✅ Toast notification muncul saat success/error

## Test Error Handling

### Test Case 11: API Error Handling

**Steps:**

1. Pastikan API server tidak aktif
2. Login dan akses berbagai halaman
3. Monitor console untuk error

**Expected Result:**

- ✅ Tidak ada error yang crash aplikasi
- ✅ Fallback ke mock data bekerja
- ✅ User experience tetap smooth
- ✅ Warning di console (bukan error)

## Checklist Testing

Gunakan checklist ini untuk memastikan semua fitur bekerja:

- [ ] Login dengan mock credentials berhasil
- [ ] Login dengan API mati tetap berhasil (fallback)
- [ ] Router guards tidak block akses setelah login
- [ ] Semua halaman admin bisa diakses
- [ ] Data mock ditampilkan dengan benar
- [ ] CRUD operations bekerja (data temporary)
- [ ] Search dan filter bekerja
- [ ] Pagination bekerja
- [ ] Toast notifications muncul
- [ ] Loading states bekerja
- [ ] Tidak ada error di console
- [ ] Logout bekerja dengan benar

## Troubleshooting

### Masalah: Login tidak berhasil

**Solusi:**

1. Cek console untuk error messages
2. Pastikan credentials benar: `admin@demo.com` / `admin`
3. Cek localStorage apakah ada data `authStore`
4. Pastikan MSW sudah aktif

### Masalah: Halaman tidak bisa diakses (redirect ke login)

**Solusi:**

1. Cek apakah sudah login (localStorage `authStore.isLogin === true`)
2. Cek abilities di localStorage apakah ada rule untuk 'default'
3. Cek console untuk error dari router guards
4. Pastikan `setAbilities()` dipanggil dengan benar saat login

### Masalah: Data tidak muncul

**Solusi:**

1. Cek console untuk error
2. Pastikan store sudah memanggil `fetch*()` method
3. Cek apakah mock data ada di file handler
4. Refresh halaman

### Masalah: MSW tidak aktif

**Solusi:**

1. Cek environment variable `USE_MOCK` (harus tidak `false`)
2. Cek console untuk error dari MSW
3. Pastikan file `mockServiceWorker.js` ada di folder `public/`
4. Clear cache browser dan reload

## Catatan Penting

1. **Data Temporary**: Semua perubahan data (create, update, delete) hanya bersifat temporary dan akan hilang saat refresh halaman.

2. **Console Warnings**: Beberapa warning di console adalah normal, seperti:

   - "API login failed, trying mock login" - menunjukkan fallback bekerja
   - "Mock Service Worker started" - menunjukkan MSW aktif

3. **Network Tab**: Di DevTools > Network, request ke API akan ditampilkan sebagai "mocked" oleh MSW.

4. **LocalStorage**: Data login disimpan di localStorage dengan key `authStore`. Abilities disimpan dalam format array of objects dengan `action` dan `subject`.
