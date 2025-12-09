import type { DataTableHeader } from 'vuetify/lib/types.mjs'

export const directPurchaseItemHeaders: DataTableHeader[] = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama Item', key: 'itemName', align: 'start', width: '25%', sortable: false },
  { title: 'Kategori', key: 'sku.item.category.name', align: 'start', width: '15%', sortable: false },
  { title: 'Qty', key: 'qty', align: 'end', width: '10%', sortable: false },
  { title: 'Satuan', key: 'itemUnit.unit.name', align: 'start', width: '10%', sortable: false },
  { title: 'Harga Satuan', key: 'unitPrice', align: 'end', width: '15%', sortable: false },
  { title: 'Total', key: 'lineTotal', align: 'end', width: '15%', sortable: false },
]
