import { computed } from 'vue'
import { usePurchaseDirectStore } from '@/stores/purchase/purchaseDirectStore'

export function useDirectPurchaseDetail(directPurchaseId: string) {
  const router = useRouter()
  const purchaseDirectStore = usePurchaseDirectStore()
  const { selectedPurchaseDirectList: purchaseDirect, isLoadingFetchDetail, isLoadingUpdate, isLoadingDelete } = storeToRefs(purchaseDirectStore)

  const statusMappings = {
    DRAFT: { color: 'warning', text: 'Draft', icon: 'tabler-clock' },
    COMPLETED: { color: 'success', text: 'Selesai', icon: 'tabler-check' },
    CANCELLED: { color: 'error', text: 'Dibatalkan', icon: 'tabler-x' },
  } as const

  const statusColor = computed(() => statusMappings[purchaseDirect.value.status]?.color ?? 'primary')
  const statusText = computed(() => statusMappings[purchaseDirect.value.status]?.text ?? 'Unknown')
  const statusIcon = computed(() => statusMappings[purchaseDirect.value.status]?.icon ?? 'tabler-help')

  const canEdit = computed(() => purchaseDirect.value.status === 'DRAFT')
  const canComplete = computed(() => purchaseDirect.value.status === 'DRAFT')
  const canCancel = computed(() => purchaseDirect.value.status === 'DRAFT')

  const handleEdit = () => {
    router.push({
      name: 'purchase-directs-direct-purchase-id-edit',
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
      purchaseRequisitionId: purchaseDirect.value.purchaseRequisitionId,
      supplierId: purchaseDirect.value.supplierId,
      status: purchaseDirect.value.status,
      subtotal: purchaseDirect.value.subtotal,
      discountTotal: purchaseDirect.value.discountTotal,
      taxTotal: purchaseDirect.value.taxTotal,
      grandTotal: purchaseDirect.value.grandTotal,
      paidTotal: purchaseDirect.value.paidTotal,
      purchasedAt: purchaseDirect.value.purchasedAt,
      note: purchaseDirect.value.note,
      documentAttachment: purchaseDirect.value.documentAttachment,
      createdAt: purchaseDirect.value.createdAt,
      updatedAt: purchaseDirect.value.updatedAt,

      outlet: purchaseDirect.value.outlet || undefined,
      supplier: purchaseDirect.value.supplier || undefined,
      items: purchaseDirect.value.items || undefined,
    })

    if (result) {
      await router.push({ name: 'purchase-directs' })
      showToast('Pembelian Langsung berhasil dihapus', 'success')
    }
  }

  const downloadDocument = () => {
    if (purchaseDirect.value.documentAttachment)
      window.open(purchaseDirect.value.documentAttachment, '_blank')
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
