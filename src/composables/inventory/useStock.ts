import { computed } from 'vue'

export function useStock(directPurchaseId: string) {
  const router = useRouter()
  const { selectedPurchaseDirectList: purchaseDirect, isLoadingFetchDetail, isLoadingUpdate, isLoadingDelete } = storeToRefs(purchaseDirectStore)

  const statusMappings = {
    draft: { color: 'warning', text: 'Draft', icon: 'tabler-clock' },
    completed: { color: 'success', text: 'Selesai', icon: 'tabler-check' },
    canceled: { color: 'error', text: 'Dibatalkan', icon: 'tabler-x' },
  } as const

  const statusColor = computed(() => statusMappings[purchaseDirect.value.status]?.color ?? 'primary')
  const statusText = computed(() => statusMappings[purchaseDirect.value.status]?.text ?? 'Unknown')
  const statusIcon = computed(() => statusMappings[purchaseDirect.value.status]?.icon ?? 'tabler-help')

  const canEdit = computed(() => purchaseDirect.value.status === 'draft')
  const canComplete = computed(() => purchaseDirect.value.status === 'draft')
  const canCancel = computed(() => purchaseDirect.value.status === 'draft')

  const handleEdit = () => {
    router.push({
      name: 'purchase-direct-purchases-direct-purchase-id-edit',
      params: { directPurchaseId },
    })
  }

  const handleComplete = async () => {
    try {
      await purchaseDirectStore.setCompleted(directPurchaseId)
      await purchaseDirectStore.fetchDetail(directPurchaseId)
    }
    catch (error) {
      console.error('Error completing purchase direct:', error)
    }
  }

  const handleCancel = async () => {
    try {
      await purchaseDirectStore.setCanceled(directPurchaseId)
      await purchaseDirectStore.fetchDetail(directPurchaseId)
    }
    catch (error) {
      console.error('Error canceling purchase direct:', error)
    }
  }

  const handleDelete = async () => {
    const result = await purchaseDirectStore.onDeleteItem({
      purchaseDirectId: purchaseDirect.value.purchaseDirectId,
      outletId: purchaseDirect.value.outletId,
      purchaseRequestId: purchaseDirect.value.purchaseRequestId,
      supplierId: purchaseDirect.value.supplierId,
      status: purchaseDirect.value.status,
      totalAmount: purchaseDirect.value.totalAmount,
      purchasedAt: purchaseDirect.value.purchasedAt,
      note: purchaseDirect.value.note,
      document: purchaseDirect.value.document,
      outletName: purchaseDirect.value.outlet?.name || '',
      supplierName: purchaseDirect.value.supplier?.name || '',
      createdAt: purchaseDirect.value.createdAt,
      updatedAt: purchaseDirect.value.updatedAt,
    })

    if (result) {
      await router.push({ name: 'purchase-direct-purchases' })
      showToast('Pembelian Langsung berhasil dihapus', 'success')
    }
  }

  const downloadDocument = () => {
    if (purchaseDirect.value.document)
      window.open(purchaseDirect.value.document, '_blank')
  }

  return {
    purchaseDirect,
    isLoadingFetchDetail,
    isLoadingUpdate,
    isLoadingDelete,
    statusColor,
    statusText,
    statusIcon,
    canEdit,
    canComplete,
    canCancel,
    handleEdit,
    handleComplete,
    handleCancel,
    handleDelete,
    downloadDocument,
  }
}
