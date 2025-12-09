export const allowedFields = [
] as const

export const allowedIncludes = [
] as const

export const allowedSorts = [
] as const

export const types = [
  {
    value: 'PURCHASE',
    title: 'Pembelian',
    icon: 'tabler-cart',
    desc: 'Pembelian adalah proses pengadaan barang atau jasa untuk memenuhi kebutuhan operasional',
  },
  {
    value: 'SALE',
    title: 'Penjualan',
    icon: 'tabler-shopping-cart',
    desc: 'Penjualan adalah transaksi pengeluaran barang kepada pelanggan',
  },
  {
    value: 'RETURN_IN',
    title: 'Retur Masuk',
    icon: 'tabler-arrow-back-up',
    desc: 'Retur masuk adalah pengembalian barang dari pelanggan ke gudang',
  },
  {
    value: 'RETURN_OUT',
    title: 'Retur Keluar',
    icon: 'tabler-arrow-forward-up',
    desc: 'Retur keluar adalah pengembalian barang ke supplier',
  },
  {
    value: 'TRANSFER',
    title: 'Transfer',
    icon: 'tabler-transfer',
    desc: 'Transfer adalah perpindahan barang antar outlet atau gudang',
  },
  {
    value: 'USAGE',
    title: 'Pemakaian',
    icon: 'tabler-box-seam',
    desc: 'Pemakaian adalah penggunaan barang untuk keperluan internal',
  },
  {
    value: 'WASTE',
    title: 'Limbah',
    icon: 'tabler-trash',
    desc: 'Limbah adalah barang yang rusak atau tidak dapat digunakan lagi',
  },
  {
    value: 'ADJUSTMENT',
    title: 'Penyesuaian',
    icon: 'tabler-adjustments',
    desc: 'Penyesuaian adalah koreksi stok untuk menyesuaikan dengan stok fisik',
  },
] as const
