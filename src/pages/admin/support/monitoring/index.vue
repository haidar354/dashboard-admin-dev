<script setup lang="ts">
import { $rootAPI } from "@/utils/api";
import VueApexCharts from "vue3-apexcharts";

definePage({
  meta: {
    name: "Platform Monitoring",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface TenantHealthMetrics {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
  uniqueEndpoints: number;
  uniqueIps: number;
  ipAddresses: string[];
}

interface TenantHealth {
  companyId: string;
  companyName: string;
  status: string;
  uptime: number;
  lastCheckedAt: string;
  metrics: TenantHealthMetrics;
  alerts: Array<{
    level: string;
    message: string;
    timestamp: string;
  }>;
}

interface ApiTrafficSummary {
  totalRequests: number;
  uniqueEndpoints: number;
  uniqueIps: number;
  successRate: number;
  avgResponseTime: number;
}

interface EndpointStat {
  endpoint: string;
  method: string;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  uniqueIps: number;
  ipAddresses: string[];
}

interface HourlyStat {
  hour: string;
  totalRequests: number;
  successfulRequests: number;
  avgResponseTime: number;
  uniqueIps: number;
  ipAddresses: string[];
}

interface ApiTraffic {
  from: string;
  to: string;
  summary: ApiTrafficSummary;
  byEndpoint: EndpointStat[];
  byHour: HourlyStat[];
  byStatus: Record<string, number>;
  byIp: Array<{
    ipAddress: string;
    totalRequests: number;
    successfulRequests: number;
    errorRequests: number;
    successRate: number;
    avgResponseTime: number;
    uniqueEndpoints: number;
  }>;
}

const isLoading = ref(false);
const tenantHealth = ref<TenantHealth[]>([]);
const apiTraffic = ref<ApiTraffic | null>(null);

const fetchTenantHealth = async () => {
  try {
    const response = await $rootAPI(
      "/platform/support/monitoring/tenant-health",
      {
        method: "GET",
      }
    );
    tenantHealth.value = response.data || [];
  } catch (error) {
    console.error("Error fetching tenant health:", error);
  }
};

const fetchApiTraffic = async () => {
  try {
    const response = await $rootAPI(
      "/platform/support/monitoring/api-traffic",
      {
        method: "GET",
      }
    );

    if (response.data && response.data.length > 0) {
      apiTraffic.value = response.data[0];
    }
  } catch (error) {
    console.error("Error fetching API traffic:", error);
  }
};

const fetchAll = async () => {
  isLoading.value = true;
  try {
    await Promise.all([fetchTenantHealth(), fetchApiTraffic()]);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchAll();
});

const getHealthColor = (status: string) => {
  const colors: Record<string, string> = {
    healthy: "success",
    warning: "warning",
    critical: "error",
    offline: "secondary",
    up: "success",
    down: "error",
    degraded: "warning",
  };
  return colors[status] || "secondary";
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("id-ID").format(num);
};

// API Traffic Chart Options
const trafficChartOptions = computed(() => ({
  chart: {
    type: "area",
    toolbar: { show: false },
    parentHeightOffset: 0,
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  colors: ["#7367F0", "#EA5455"],
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 0.9,
      opacityFrom: 0.5,
      opacityTo: 0.1,
    },
  },
  xaxis: {
    categories:
      apiTraffic.value?.byHour?.map((d) => {
        const date = new Date(d.hour);
        return `${date.getHours()}:00`;
      }) || [],
    labels: { style: { fontSize: "10px" } },
  },
  yaxis: {
    labels: { style: { fontSize: "10px" } },
  },
  legend: { position: "top" as const },
  tooltip: { shared: true },
}));

const trafficSeries = computed(() => [
  {
    name: "Successful",
    data: apiTraffic.value?.byHour?.map((d) => d.successfulRequests) || [],
  },
  {
    name: "Total",
    data: apiTraffic.value?.byHour?.map((d) => d.totalRequests) || [],
  },
]);

const topEndpoints = computed(() => {
  if (!apiTraffic.value?.byEndpoint) return [];

  return apiTraffic.value.byEndpoint
    .filter((e) => e.method !== "OPTIONS")
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 10);
});

const statusBreakdown = computed(() => {
  if (!apiTraffic.value?.byStatus) return [];

  return Object.entries(apiTraffic.value.byStatus).map(([status, count]) => ({
    status,
    count,
  }));
});

const getStatusColor = (status: string) => {
  if (status.startsWith("2")) return "success";
  if (status.startsWith("3")) return "info";
  if (status.startsWith("4")) return "warning";
  if (status.startsWith("5")) return "error";
  return "secondary";
};
</script>

<template>
  <div data-testid="platform-monitoring-page">
    <VRow v-if="isLoading">
      <VCol cols="12" class="text-center py-10">
        <VProgressCircular indeterminate color="primary" />
      </VCol>
    </VRow>

    <template v-else>
      <!-- API Traffic Summary -->
      <VRow>
        <VCol cols="12" md="3">
          <VCard>
            <VCardText>
              <div class="d-flex align-center gap-3">
                <VAvatar color="primary" variant="tonal" size="48">
                  <VIcon icon="tabler-api" size="28" />
                </VAvatar>
                <div>
                  <p class="text-caption text-disabled mb-0">Total Requests</p>
                  <h4 class="text-h4">
                    {{ formatNumber(apiTraffic?.summary?.totalRequests || 0) }}
                  </h4>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="3">
          <VCard>
            <VCardText>
              <div class="d-flex align-center gap-3">
                <VAvatar color="success" variant="tonal" size="48">
                  <VIcon icon="tabler-check" size="28" />
                </VAvatar>
                <div>
                  <p class="text-caption text-disabled mb-0">Success Rate</p>
                  <h4 class="text-h4 text-success">
                    {{ apiTraffic?.summary?.successRate?.toFixed(2) || 0 }}%
                  </h4>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="3">
          <VCard>
            <VCardText>
              <div class="d-flex align-center gap-3">
                <VAvatar color="info" variant="tonal" size="48">
                  <VIcon icon="tabler-clock" size="28" />
                </VAvatar>
                <div>
                  <p class="text-caption text-disabled mb-0">Avg Response</p>
                  <h4 class="text-h4">
                    {{
                      apiTraffic?.summary?.avgResponseTime?.toFixed(2) || 0
                    }}ms
                  </h4>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="3">
          <VCard>
            <VCardText>
              <div class="d-flex align-center gap-3">
                <VAvatar color="warning" variant="tonal" size="48">
                  <VIcon icon="tabler-route" size="28" />
                </VAvatar>
                <div>
                  <p class="text-caption text-disabled mb-0">
                    Unique Endpoints
                  </p>
                  <h4 class="text-h4">
                    {{ apiTraffic?.summary?.uniqueEndpoints || 0 }}
                  </h4>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- API Traffic Chart & Status -->
      <VRow class="mt-4">
        <VCol cols="12" lg="8">
          <VCard>
            <VCardTitle>API Traffic (24 Hours)</VCardTitle>
            <VCardText>
              <VueApexCharts
                v-if="apiTraffic?.byHour && apiTraffic.byHour.length > 0"
                type="area"
                height="300"
                :options="trafficChartOptions"
                :series="trafficSeries"
              />
              <div v-else class="text-center py-8 text-disabled">
                No traffic data available
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" lg="4">
          <VCard>
            <VCardTitle>Status Breakdown</VCardTitle>
            <VCardText>
              <VList v-if="statusBreakdown.length > 0" density="compact">
                <VListItem v-for="item in statusBreakdown" :key="item.status">
                  <template #prepend>
                    <VChip
                      size="small"
                      :color="getStatusColor(item.status)"
                      variant="tonal"
                    >
                      {{ item.status }}
                    </VChip>
                  </template>
                  <VListItemTitle class="ms-2"
                    >{{ formatNumber(item.count) }} requests</VListItemTitle
                  >
                </VListItem>
              </VList>
              <div v-else class="text-center py-8 text-disabled">
                No status data available
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Top Endpoints -->
      <VRow class="mt-4">
        <VCol cols="12">
          <VCard>
            <VCardTitle>Top Endpoints</VCardTitle>
            <VCardText>
              <VDataTable
                v-if="topEndpoints.length > 0"
                :headers="[
                  { title: 'Endpoint', key: 'endpoint' },
                  { title: 'Method', key: 'method', width: '100px' },
                  { title: 'Requests', key: 'totalRequests', align: 'end' },
                  { title: 'Success Rate', key: 'successRate', align: 'end' },
                  { title: 'Avg Time', key: 'avgResponseTime', align: 'end' },
                  { title: 'Unique IPs', key: 'uniqueIps', align: 'end' },
                ]"
                :items="topEndpoints"
                class="text-no-wrap"
              >
                <template #item.endpoint="{ item }">
                  <code class="text-caption">{{ item.endpoint }}</code>
                </template>
                <template #item.method="{ item }">
                  <VChip size="small" variant="tonal">
                    {{ item.method }}
                  </VChip>
                </template>
                <template #item.totalRequests="{ item }">
                  {{ formatNumber(item.totalRequests) }}
                </template>
                <template #item.successRate="{ item }">
                  <span
                    :class="
                      item.successRate < 90 ? 'text-error' : 'text-success'
                    "
                  >
                    {{ item.successRate.toFixed(2) }}%
                  </span>
                </template>
                <template #item.avgResponseTime="{ item }">
                  <span
                    :class="item.avgResponseTime > 100 ? 'text-warning' : ''"
                  >
                    {{ item.avgResponseTime.toFixed(2) }}ms
                  </span>
                </template>
              </VDataTable>
              <div v-else class="text-center py-8 text-disabled">
                No endpoint data available
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Tenant Health -->
      <VRow class="mt-4">
        <VCol cols="12">
          <VCard>
            <VCardTitle>Tenant Health Status</VCardTitle>
            <VCardText>
              <VDataTable
                :headers="[
                  { title: 'Company', key: 'companyName' },
                  { title: 'Status', key: 'status' },
                  { title: 'Uptime', key: 'uptime', align: 'end' },
                  {
                    title: 'Total Requests',
                    key: 'metrics.totalRequests',
                    align: 'end',
                  },
                  {
                    title: 'Success Rate',
                    key: 'metrics.successRate',
                    align: 'end',
                  },
                  {
                    title: 'Error Rate',
                    key: 'metrics.errorRate',
                    align: 'end',
                  },
                  {
                    title: 'Avg Response',
                    key: 'metrics.avgResponseTime',
                    align: 'end',
                  },
                  { title: 'Alerts', key: 'alerts', width: '80px' },
                ]"
                :items="tenantHealth"
                class="text-no-wrap"
              >
                <template #item.status="{ item }">
                  <VChip size="small" :color="getHealthColor(item.status)">
                    {{ item.status }}
                  </VChip>
                </template>
                <template #item.uptime="{ item }">
                  {{ item.uptime }}%
                </template>
                <template #item.metrics.totalRequests="{ item }">
                  {{ formatNumber(item.metrics.totalRequests) }}
                </template>
                <template #item.metrics.successRate="{ item }">
                  <span
                    :class="
                      item.metrics.successRate < 95
                        ? 'text-warning'
                        : 'text-success'
                    "
                  >
                    {{ item.metrics.successRate.toFixed(2) }}%
                  </span>
                </template>
                <template #item.metrics.errorRate="{ item }">
                  <span :class="item.metrics.errorRate > 2 ? 'text-error' : ''">
                    {{ item.metrics.errorRate.toFixed(2) }}%
                  </span>
                </template>
                <template #item.metrics.avgResponseTime="{ item }">
                  <span
                    :class="
                      item.metrics.avgResponseTime > 500 ? 'text-warning' : ''
                    "
                  >
                    {{ item.metrics.avgResponseTime.toFixed(2) }}ms
                  </span>
                </template>
                <template #item.alerts="{ item }">
                  <VChip
                    v-if="item.alerts && item.alerts.length > 0"
                    size="small"
                    :color="
                      item.alerts[0].level === 'warning' ? 'warning' : 'error'
                    "
                  >
                    {{ item.alerts.length }}
                  </VChip>
                  <span v-else class="text-disabled">-</span>
                </template>

                <template #expanded-row="{ item }">
                  <tr>
                    <td :colspan="8">
                      <div class="pa-4">
                        <h6 class="text-h6 mb-3">Alerts</h6>
                        <VList
                          v-if="item.alerts && item.alerts.length > 0"
                          density="compact"
                        >
                          <VListItem
                            v-for="(alert, idx) in item.alerts"
                            :key="idx"
                          >
                            <template #prepend>
                              <VIcon
                                :icon="
                                  alert.level === 'warning'
                                    ? 'tabler-alert-triangle'
                                    : 'tabler-alert-circle'
                                "
                                :color="
                                  alert.level === 'warning'
                                    ? 'warning'
                                    : 'error'
                                "
                                size="20"
                              />
                            </template>
                            <VListItemTitle>{{ alert.message }}</VListItemTitle>
                            <VListItemSubtitle>
                              {{
                                new Date(alert.timestamp).toLocaleString(
                                  "id-ID"
                                )
                              }}
                            </VListItemSubtitle>
                          </VListItem>
                        </VList>
                        <p v-else class="text-disabled mb-0">No alerts</p>
                      </div>
                    </td>
                  </tr>
                </template>
              </VDataTable>
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
