<script setup lang="ts">
import dayjs from 'dayjs'
import { useAdminPaymentStore } from '@/stores/admin/billingStore'
import { customDebounce } from '@/utils/common'

definePage({
  meta: {
    name: 'Admin Payments',
    rules: [{ action: 'manage', subject: 'default' }],
  },
})

const paymentStore = useAdminPaymentStore()
const { paginateData, isLoading, requestQuery, additionalFilter } = storeToRefs(paymentStore)

const search = ref('')

const headers = [
  { title: 'No', key: 'index', width: '60px', sortable: false },
  { title: 'Invoice', key: 'invoiceNumber', sortable: true },
  { title: 'Company', key: 'companyName', sortable: true },
  { title: 'Amount', key: 'amount', sortable: false },
  { title: 'Metode', key: 'paymentMethod', sortable: false },
  { title: 'Gateway', key: 'paymentGateway', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Dibayar', key: 'paidAt', sortable: true },
]

watch(search, customDebounce((val: string) => {
  requestQuery.value.search = val
  requestQuery.value.page = 1
}, 500))

watch([requestQuery, additionalFilter], async () => {
  await paymentStore.fetchPayments()
}, { deep: true })

onMounted(async () => {
  await paymentStore.fetchPayments()
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    success: 'success',
    failed: 'error',
    refunded: 'info',
  }

  return colors[status] || 'secondary'
}

const getMethodText = (method: string) => {
  const texts: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    ewallet: 'E-Wallet',
    va: 'Virtual Account',
  }

  return texts[method] || method
}

const getGatewayColor = (gateway: string) => {
  const colors: Record<string, string> = {
    midtrans: 'primary',
    xendit: 'info',
    manual: 'secondary',
  }

  return colors[gateway] || 'secondary'
}
</script>

<template>
  <div data-testid="admin-payments-page">
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between align-center gap-4">
        <h5 class="text-h5">
          Riwayat Payment
        </h5>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <AppTextField
              v-model="search"
              placeholder="Cari payment..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            sm="3"
          >
            <AppSelect
              v-model="additionalFilter.status"
              label="Status"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Pending', value: 'pending' },
                { title: 'Success', value: 'success' },
                { title: 'Failed', value: 'failed' },
                { title: 'Refunded', value: 'refunded' },
              ]"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            sm="3"
          >
            <AppSelect
              v-model="additionalFilter.paymentMethod"
              label="Metode"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Bank Transfer', value: 'bank_transfer' },
                { title: 'Credit Card', value: 'credit_card' },
                { title: 'E-Wallet', value: 'ewallet' },
                { title: 'Virtual Account', value: 'va' },
              ]"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            sm="2"
            class="d-flex align-center"
          >
            <VBtn
              variant="outlined"
              @click="paymentStore.resetFilter()"
            >
              Reset
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoading"
        :items-per-page="requestQuery.perPage"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (requestQuery.page! - 1) * requestQuery.perPage! + index + 1 }}
        </template>

        <template #item.invoiceNumber="{ item }">
          <span class="font-weight-medium text-primary">{{ item.invoiceNumber }}</span>
        </template>

        <template #item.amount="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.amount) }}</span>
        </template>

        <template #item.paymentMethod="{ item }">
          {{ getMethodText(item.paymentMethod) }}
        </template>

        <template #item.paymentGateway="{ item }">
          <VChip
            size="small"
            :color="getGatewayColor(item.paymentGateway)"
            variant="tonal"
          >
            {{ item.paymentGateway }}
          </VChip>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="getStatusColor(item.status)"
          >
            {{ item.status }}
          </VChip>
        </template>

        <template #item.paidAt="{ item }">
          {{ item.paidAt ? dayjs(item.paidAt).format('DD/MM/YYYY HH:mm') : '-' }}
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex justify-end">
              <VPagination
                v-model="requestQuery.page"
                :length="paginateData.meta?.lastPage || 1"
                :total-visible="5"
              />
            </div>
          </VCardText>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
