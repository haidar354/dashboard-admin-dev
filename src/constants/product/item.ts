export const allowedFields = [
  'itemId',
  'name',
] as const

export const allowedIncludes = [
  'itemCategory',
  'outlets',
  'itemOutlets.outlet',
  'itemOutlets.outlet.stock',
  'defaultUnit',
  'defaultUnit.itemSku',
  'defaultUnit.itemBarcode',
  'units',
  'activeItemPrice',
] as const

export const allowedSorts = [
  'name',
  'createdAt',
  'updatedAt',
  'itemCategory.name',
  'defaultUnit.name',
] as const

export const itemKinds = [
  {
    value: 'product',
    title: 'Produk',
    icon: 'tabler-box',
    desc: 'Produk adalah barang yang ditawarkan kepada konsumen untuk dijual',
  },
  {
    value: 'material',
    title: 'Bahan',
    icon: 'tabler-carrot',
    desc: 'Bahan adalah barang yang digunakan untuk membuat produk',
  },
  {
    value: 'service',
    title: 'Layanan',
    icon: 'tabler-microwave',
    desc: 'Layanan adalah produk yang tidak berbentuk fisik dan ditawarkan kepada konsumen',
  },

  // {
  //   value: 'consumable',
  //   title: 'Bahan Habis Pakai',
  //   icon: 'tabler-bottle',
  //   desc: 'Bahan habis pakai adalah bahan yang digunakan sekali dan tidak dapat digunakan kembali',
  // },
] as const

export const itemTypes = [
  {
    value: 'raw',
    title: 'Bahan Baku',
    icon: 'tabler-carrot',
    desc: 'Bahan baku adalah bahan yang belum diolah atau belum siap untuk dijual',
  },
  {
    value: 'semi',
    title: 'Bahan Setengah Jadi',
    icon: 'tabler-microwave',
    desc: 'Bahan setengah jadi adalah bahan yang telah diolah sebagian dan siap untuk dijual',
  },
  {
    value: 'finished',
    title: 'Produk Jadi',
    icon: 'tabler-burger',
    desc: 'Produk jadi adalah produk yang telah siap untuk dijual',
  },

  // {
  //   value: 'consumable',
  //   title: 'Bahan Habis Pakai',
  //   icon: 'tabler-bottle',
  //   desc: 'Bahan habis pakai adalah bahan yang digunakan sekali dan tidak dapat digunakan kembali',
  // },
] as const

export const saleFulfillmentLabel = {
  RECIPE: 'Diproduksi saat Penjualan',
  FINISHED_STOCK: 'Dari Stok',
  EITHER: 'Bebas (Produksi/Stok)',
  NONE: '-',
} as const

export const manufacturingSourceLabel = {
  IN_HOUSE: 'Produksi Sendiri',
  PURCHASED: 'Pembelian',
  EITHER: 'Bebas (Produksi/Beli)',
  NONE: '-',
} as const

export const productionSitePolicyLabel = {
  CENTRAL_ONLY: 'Outlet Pusat',
  OUTLET_ONLY: 'Outlet Cabang',
  EITHER: 'Bebas (Outlet Pusat/Cabang)',
  NONE: '-',
} as const
