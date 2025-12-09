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
  'units',
] as const

export const allowedSorts = [
  'name',
  'createdAt',
  'updatedAt',
  'itemCategory.name',
  'defaultUnit.name',
] as const

export const itemTypes = [
  {
    value: 'product',
    title: 'Produk Jadi',
    icon: 'tabler-burger',
    desc: 'Produk jadi adalah produk yang telah selesai diproduksi dan siap untuk dijual',
  },
  {
    value: 'material',
    title: 'Bahan',
    icon: 'tabler-carrot',
    desc: 'Bahan atau bahan baku adalah bahan yang belum diolah atau setengah jadi',
  },
  {
    value: 'service',
    title: 'Jasa',
    icon: 'tabler-microwave',
    desc: 'Jasa adalah layanan yang tidak memiliki bentuk fisik dan tidak dapat disimpan',
  },

  // {
  //   value: 'consumable',
  //   title: 'Bahan Habis Pakai',
  //   icon: 'tabler-bottle',
  //   desc: 'Bahan habis pakai adalah bahan yang digunakan sekali dan tidak dapat digunakan kembali',
  // },
] as const
