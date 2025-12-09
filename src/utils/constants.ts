export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

export const months = ref([
  { title: 'Januari', value: 1 },
  { title: 'Februari', value: 2 },
  { title: 'Maret', value: 3 },
  { title: 'April', value: 4 },
  { title: 'Mei', value: 5 },
  { title: 'Juni', value: 6 },
  { title: 'Juli', value: 7 },
  { title: 'Agustus', value: 8 },
  { title: 'September', value: 9 },
  { title: 'Oktober', value: 10 },
  { title: 'November', value: 11 },
  { title: 'Desember', value: 12 },
])

export const religions = ['Islam', 'Kristen', 'Katholik', 'Hindu', 'Budha', 'Khong Hucu'] as const
export const genders = ['Laki-Laki', 'Perempuan'] as const

export const accountStatuses = [
  {
    value: 1,
    title: 'Aktif',
  },
  {
    value: 0,
    title: 'Tidak Aktif',
  },
]

export const perPages = [
  {
    value: 10,
    title: 10,
  },
  {
    value: 20,
    title: 20,
  },
  {
    value: 30,
    title: 30,
  },
  {
    value: 50,
    title: 50,
  },
  {
    value: 100,
    title: 100,
  },
  {
    value: 9999999999999,
    title: 'Semua',
  },
]
