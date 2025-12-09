import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { usePurchaseDirectStore } from '@/stores/purchase/purchaseDirectStore'
import { usePurchaseRequestStore } from '@/stores/purchase/purchaseRequestStore'
import { useSupplierStore } from '@/stores/purchase/supplierStore'
import type { PurchaseDirectItemForm } from '@/types/models/purchase/purchase-direct'

export function useDirectPurchaseCreate() {
  const router = useRouter()
  const outletStore = useOutletSidebarStore()
  const supplierStore = useSupplierStore()
  const purchaseRequestStore = usePurchaseRequestStore()
  const purchaseDirectStore = usePurchaseDirectStore()

  // Refs
  const selectedPurchaseRequest = ref(null)
  const documentPreview = ref('')
  const isItemModalVisible = ref(false)

  // Store refs
  const { form, formErrors, isLoadingCreate } = storeToRefs(purchaseDirectStore)
  const { data: outlets, selectedSidebarOutlet, isLoadingFetchData: isLoadingFetchDataOutlets } = storeToRefs(outletStore)
  const { data: suppliers, isLoadingFetchData: isLoadingFetchDataSuppliers } = storeToRefs(supplierStore)
  const { data: purchaseRequests, isLoadingFetchData: isLoadingFetchDataPurchaseRequests } = storeToRefs(purchaseRequestStore)

  // Computed
  const outletId = computed(() => {
    if (form.value.outletId)
      return form.value.outletId

    return selectedSidebarOutlet.value?.outletId || ''
  })

  const totalAmount = computed(() => {
    return form.value.items?.reduce((total, item) => {
      return total + ((item.qty || 0) * (item.unitPrice || 0))
    }, 0)
  })

  const filteredPurchaseRequests = computed(() => {
    if (!form.value.outletId || !form.value.supplierId)
      return []

    return purchaseRequests.value.filter(req =>
      req.outletId === form.value.outletId
      && req.supplierId === form.value.supplierId
      && req.status === 'approved',
    )
  })

  // Methods
  const initializeForm = async () => {
    form.value.outletId = selectedSidebarOutlet.value?.outletId
    form.value.purchasedAt = dayjs().format('YYYY-MM-DD HH:mm')

    await Promise.all([
      outletStore.fetchAllData(),
      supplierStore.fetchAllData(),
    ])
  }

  const handleFilePreview = (newFile: File | File[] | null) => {
    let file = newFile
    if (Array.isArray(newFile))
      file = newFile[0]

    if (file instanceof File) {
      const reader = new FileReader()

      reader.onload = e => {
        documentPreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
    else {
      documentPreview.value = ''
    }
  }

  const showItemModal = async () => {
    if (!form.value.outletId) {
      showToast('Silahkan pilih Outlet terlebih dahulu!', 'error')

      return
    }
    isItemModalVisible.value = true
  }

  const removeItem = (index: number) => {
    form.value.items?.splice(index, 1)
  }

  const handleSubmit = async (status: 'DRAFT' | 'COMPLETED') => {
    try {
      const result = await purchaseDirectStore.create(status)
      if (result) {
        router.push({ name: 'purchase-directs' }).then(() => {
          showToast('Pembelian langsung berhasil ditambahkan', 'success')
        })
      }
    }
    catch (error) {
      console.error('Error creating purchase direct:', error)
    }
  }

  const handleCancel = () => {
    router.push({ name: 'purchase-directs' })
  }

  const addSelectedItemOutlet = (purchaseDirectItem: PurchaseDirectItemForm[]) => {
    form.value.items = purchaseDirectItem
  }

  return {
    // State
    form,
    formErrors,
    outlets,
    suppliers,
    selectedPurchaseRequest,
    documentPreview,
    isItemModalVisible,

    // Computed
    outletId,
    totalAmount,
    filteredPurchaseRequests,

    // Loading states
    isLoadingCreate,
    isLoadingFetchDataOutlets,
    isLoadingFetchDataSuppliers,
    isLoadingFetchDataPurchaseRequests,

    // Methods
    initializeForm,
    handleFilePreview,
    showItemModal,
    removeItem,
    handleSubmit,
    handleCancel,
    addSelectedItemOutlet,
  }
}
