<script setup lang="ts">
import { useAdminDashboardStore } from '@/stores/admin/dashboardStore'

definePage({
  meta: {
    name: 'Admin Dashboard',
    rules: [
      { action: 'manage', subject: 'default' },
    ],
  },
})

const dashboardStore = useAdminDashboardStore()
const { stats, tenantGrowth, revenueData, subscriptionStatus, recentActivities, isLoading } = storeToRefs(dashboardStore)

onMounted(async () => {
  await dashboardStore.fetchDashboardData()
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Chart Options for Tenant Growth
const tenantGrowthChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    parentHeightOffset: 0,
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#7367F0', '#EA5455'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.9,
      opacityFrom: 0.5,
      opacityTo: 0.1,
    },
  },
  xaxis: {
    categories: tenantGrowth.value.length > 0 ? tenantGrowth.value.map(d => d.month) : [],
    labels: { style: { fontSize: '12px' } },
  },
  yaxis: {
    labels: { style: { fontSize: '12px' } },
  },
  legend: { position: 'top' },
  tooltip: { shared: true },
}))

const tenantGrowthSeries = computed(() => {
  if (tenantGrowth.value.length === 0) {
    return [
      { name: 'Tenant Baru', data: [] },
      { name: 'Churned', data: [] },
    ]
  }
  return [
    {
      name: 'Tenant Baru',
      data: tenantGrowth.value.map(d => d.newTenants || 0),
    },
    {
      name: 'Churned',
      data: tenantGrowth.value.map(d => d.churnedTenants || 0),
    },
  ]
})

// Revenue Chart Options
const revenueChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    parentHeightOffset: 0,
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '60%',
    },
  },
  dataLabels: { enabled: false },
  colors: ['#28C76F', '#00CFE8'],
  xaxis: {
    categories: revenueData.value.length > 0 ? revenueData.value.map(d => d.month) : [],
    labels: { style: { fontSize: '12px' } },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${(val / 1000000).toFixed(0)}jt`,
      style: { fontSize: '12px' },
    },
  },
  legend: { position: 'top' },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val),
    },
  },
}))

const revenueSeries = computed(() => {
  if (revenueData.value.length === 0) {
    return [
      { name: 'Revenue', data: [] },
      { name: 'Target', data: [] },
    ]
  }
  return [
    {
      name: 'Revenue',
      data: revenueData.value.map(d => d.revenue || 0),
    },
    {
      name: 'Target',
      data: revenueData.value.map(d => d.target || 0),
    },
  ]
})

// Subscription Donut Chart
const subscriptionChartOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: ['Active', 'Trial', 'Expired', 'Cancelled'],
  colors: ['#28C76F', '#FF9F43', '#EA5455', '#82868B'],
  legend: { position: 'bottom' },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
          },
        },
      },
    },
  },
}))

const subscriptionSeries = computed(() => {
  const status = subscriptionStatus.value
  if (!status || Object.keys(status).length === 0) {
    return [0, 0, 0, 0]
  }
  return [
    status.active || 0,
    status.trial || 0,
    status.expired || 0,
    status.cancelled || 0,
  ]
})

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    tenant_created: 'success',
    subscription: 'primary',
    ticket: 'warning',
    payment: 'success',
    error: 'error',
  }
  return colors[type] || 'secondary'
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return 'Baru saja'
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}
</script>

<template>
  <div data-testid="admin-dashboard">
    <VRow v-if="isLoading">
      <VCol cols="12" class="text-center py-10">
        <VProgressCircular indeterminate color="primary" size="48" />
        <p class="mt-4 text-body-1">Memuat data dashboard...</p>
      </VCol>
    </VRow>

    <template v-else>
      <!-- Stats Cards -->
      <VRow>
        <VCol cols="12" sm="6" lg="3">
          <VCard data-testid="stat-total-tenants">
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="primary" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-building" size="28" />
              </VAvatar>
              <div>
                <p class="text-body-2 mb-0">Total Tenants</p>
                <h4 class="text-h4">{{ stats.totalTenants }}</h4>
                <p class="text-caption text-success mb-0">
                  <VIcon icon="tabler-trending-up" size="14" />
                  {{ stats.activeTenants }} aktif
                </p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" lg="3">
          <VCard data-testid="stat-revenue">
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="success" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-currency-dollar" size="28" />
              </VAvatar>
              <div>
                <p class="text-body-2 mb-0">Revenue Bulan Ini</p>
                <h4 class="text-h5">{{ formatCurrency(stats.monthlyRevenue) }}</h4>
                <p class="text-caption text-secondary mb-0">
                  Total: {{ formatCurrency(stats.totalRevenue) }}
                </p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" lg="3">
          <VCard data-testid="stat-tickets">
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="warning" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-ticket" size="28" />
              </VAvatar>
              <div>
                <p class="text-body-2 mb-0">Open Tickets</p>
                <h4 class="text-h4">{{ stats.openTickets }}</h4>
                <p class="text-caption text-warning mb-0">
                  Perlu ditangani
                </p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" lg="3">
          <VCard data-testid="stat-errors">
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="error" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-alert-triangle" size="28" />
              </VAvatar>
              <div>
                <p class="text-body-2 mb-0">Critical Errors</p>
                <h4 class="text-h4">{{ stats.criticalErrors }}</h4>
                <p class="text-caption text-error mb-0">
                  Perlu investigasi
                </p>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Charts Row -->
      <VRow class="mt-2">
        <!-- Tenant Growth Chart -->
        <VCol cols="12" lg="8">
          <VCard data-testid="tenant-growth-chart">
            <VCardTitle class="d-flex justify-space-between align-center">
              <span>Pertumbuhan Tenant</span>
              <VChip size="small" color="primary">12 Bulan Terakhir</VChip>
            </VCardTitle>
            <VCardText>
              <VueApexCharts
                v-if="tenantGrowth.length > 0"
                type="area"
                height="300"
                :options="tenantGrowthChartOptions"
                :series="tenantGrowthSeries"
              />
              <div v-else class="text-center py-10">
                <p class="text-body-2 text-disabled">Data belum tersedia</p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Subscription Status -->
        <VCol cols="12" lg="4">
          <VCard data-testid="subscription-chart">
            <VCardTitle>Status Subscription</VCardTitle>
            <VCardText>
              <VueApexCharts
                v-if="subscriptionStatus && Object.keys(subscriptionStatus).length > 0"
                type="donut"
                height="250"
                :options="subscriptionChartOptions"
                :series="subscriptionSeries"
              />
              <div v-else class="text-center py-10">
                <p class="text-body-2 text-disabled">Data belum tersedia</p>
              </div>
              <VDivider class="my-4" />
              <div class="d-flex flex-column gap-2">
                <div v-for="plan in subscriptionStatus.byPlan" :key="plan.planName" class="d-flex justify-space-between">
                  <span class="text-body-2">{{ plan.planName }}</span>
                  <span class="text-body-2 font-weight-medium">{{ plan.count }} ({{ plan.percentage }}%)</span>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Revenue & Activities Row -->
      <VRow class="mt-2">
        <!-- Revenue Chart -->
        <VCol cols="12" lg="8">
          <VCard data-testid="revenue-chart">
            <VCardTitle class="d-flex justify-space-between align-center">
              <span>Revenue vs Target</span>
              <VChip size="small" color="success">2024</VChip>
            </VCardTitle>
            <VCardText>
              <VueApexCharts
                v-if="revenueData.length > 0"
                type="bar"
                height="300"
                :options="revenueChartOptions"
                :series="revenueSeries"
              />
              <div v-else class="text-center py-10">
                <p class="text-body-2 text-disabled">Data belum tersedia</p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Recent Activities -->
        <VCol cols="12" lg="4">
          <VCard data-testid="recent-activities">
            <VCardTitle class="d-flex justify-space-between align-center">
              <span>Aktivitas Terbaru</span>
              <VBtn variant="text" size="small" color="primary">Lihat Semua</VBtn>
            </VCardTitle>
            <VCardText class="pb-0">
              <VList density="compact" class="py-0">
                <VListItem
                  v-for="activity in recentActivities.slice(0, 5)"
                  :key="activity.id"
                  class="px-0"
                >
                  <template #prepend>
                    <VAvatar :color="getActivityColor(activity.type)" variant="tonal" size="36" rounded>
                      <VIcon :icon="activity.icon" size="20" />
                    </VAvatar>
                  </template>
                  <VListItemTitle class="text-body-2 font-weight-medium">
                    {{ activity.title }}
                  </VListItemTitle>
                  <VListItemSubtitle class="text-caption">
                    {{ activity.description }}
                  </VListItemSubtitle>
                  <template #append>
                    <span class="text-caption text-disabled">{{ formatTime(activity.timestamp) }}</span>
                  </template>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";
</style>
