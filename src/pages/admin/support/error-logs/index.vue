<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import dayjs from "dayjs";

definePage({
  meta: {
    name: "Platform Error Logs",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface ErrorLog {
  errorLogId: string;
  ticketId: string | null;
  errorCode: string;
  errorMessage: string;
  errorType: string;
  stackTrace: string;
  severity: "info" | "warning" | "error" | "critical";
  url: string;
  httpMethod: string;
  context: {
    request_id: string;
    user_agent: string;
    ip_address: string;
    timestamp: string;
  };
  companyId: string | null;
  businessUnitId: string | null;
  outletId: string | null;
  userId: string | null;
  environment: string;
  isReviewed: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  perPage: number;
  from: number;
  to: number;
  total: number;
  lastPage: number;
  hasMore: boolean;
}

interface PaginateData {
  data: ErrorLog[];
  meta: PaginationMeta | null;
}

const isLoading = ref(false);
const paginateData = ref<PaginateData>({
  data: [],
  meta: null,
});

const requestQuery = ref({
  page: 1,
  perPage: 20,
  search: "",
});

const additionalFilter = ref({
  severity: "",
  environment: "",
});

const search = ref("");
const detailDialogVisible = ref(false);
const selectedLog = ref<ErrorLog | null>(null);

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Severity", key: "severity", sortable: false },
  { title: "Error Code", key: "errorCode", sortable: false },
  { title: "Message", key: "errorMessage", sortable: false },
  { title: "Environment", key: "environment", sortable: false },
  { title: "Reviewed", key: "isReviewed", sortable: false },
  { title: "Waktu", key: "createdAt", sortable: false },
  { title: "Aksi", key: "actions", width: "80px", sortable: false },
];

const fetchErrorLogs = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {
      page: requestQuery.value.page,
      perPage: requestQuery.value.perPage,
    };

    if (requestQuery.value.search) {
      params["filter[errorMessage]"] = requestQuery.value.search;
    }

    if (additionalFilter.value.severity) {
      params["filter[severity]"] = additionalFilter.value.severity;
    }

    if (additionalFilter.value.environment) {
      params["filter[environment]"] = additionalFilter.value.environment;
    }

    const response = (await $rootAPI("/platform/support/error-logs", {
      method: "GET",
      params,
    })) as any;

    paginateData.value = {
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error fetching error logs:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchErrorLogDetail = async (errorLogId: string) => {
  try {
    isLoading.value = true;

    const response = (await $rootAPI(
      `/platform/support/error-logs/${errorLogId}`,
      {
        method: "GET",
      }
    )) as any;

    selectedLog.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("Error fetching error log detail:", error);
  } finally {
    isLoading.value = false;
  }
};

const viewDetail = (log: ErrorLog) => {
  fetchErrorLogDetail(log.errorLogId);
};

const resetFilter = () => {
  search.value = "";
  requestQuery.value.search = "";
  requestQuery.value.page = 1;
  additionalFilter.value.severity = "";
  additionalFilter.value.environment = "";
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: "info",
    warning: "warning",
    error: "error",
    critical: "error",
  };
  return colors[severity] || "secondary";
};

const getSeverityIcon = (severity: string) => {
  const icons: Record<string, string> = {
    info: "tabler-info-circle",
    warning: "tabler-alert-triangle",
    error: "tabler-circle-x",
    critical: "tabler-alert-octagon",
  };
  return icons[severity] || "tabler-circle";
};

const getEnvironmentColor = (environment: string) => {
  const colors: Record<string, string> = {
    production: "error",
    staging: "warning",
    development: "info",
  };
  return colors[environment] || "secondary";
};

watch(
  search,
  customDebounce((val: string) => {
    requestQuery.value.search = val;
    requestQuery.value.page = 1;
  }, 500)
);

watch(
  [requestQuery, additionalFilter],
  async () => {
    await fetchErrorLogs();
  },
  { deep: true }
);

onMounted(async () => {
  await fetchErrorLogs();
});
</script>

<template>
  <div data-testid="platform-error-logs-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Error Logs</h5>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari error message..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="3">
            <AppSelect
              v-model="additionalFilter.severity"
              label="Severity"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Info', value: 'info' },
                { title: 'Warning', value: 'warning' },
                { title: 'Error', value: 'error' },
                { title: 'Critical', value: 'critical' },
              ]"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="3">
            <AppSelect
              v-model="additionalFilter.environment"
              label="Environment"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Production', value: 'production' },
                { title: 'Staging', value: 'staging' },
                { title: 'Development', value: 'development' },
              ]"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="2" class="d-flex align-center mt-6">
            <VBtn variant="outlined" @click="resetFilter"> Reset </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoading"
        v-model:page="requestQuery.page"
        v-model:items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (requestQuery.page - 1) * requestQuery.perPage + index + 1 }}
        </template>

        <template #item.severity="{ item }">
          <VChip size="small" :color="getSeverityColor(item.severity)">
            <VIcon
              :icon="getSeverityIcon(item.severity)"
              size="14"
              class="me-1"
            />
            {{ item.severity }}
          </VChip>
        </template>

        <template #item.errorCode="{ item }">
          <code class="text-caption">{{ item.errorCode }}</code>
        </template>

        <template #item.errorMessage="{ item }">
          <div style="max-width: 300px" class="text-truncate">
            {{ item.errorMessage }}
          </div>
        </template>

        <template #item.environment="{ item }">
          <VChip
            size="small"
            :color="getEnvironmentColor(item.environment)"
            variant="tonal"
          >
            {{ item.environment }}
          </VChip>
        </template>

        <template #item.isReviewed="{ item }">
          <VChip
            size="small"
            :color="item.isReviewed ? 'success' : 'secondary'"
          >
            {{ item.isReviewed ? "Reviewed" : "Not Reviewed" }}
          </VChip>
        </template>

        <template #item.createdAt="{ item }">
          {{ dayjs(item.createdAt).format("DD/MM/YYYY HH:mm:ss") }}
        </template>

        <template #item.actions="{ item }">
          <IconBtn size="small" @click="viewDetail(item)">
            <VIcon icon="tabler-eye" color="info" />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Detail Dialog -->
    <VDialog v-model="detailDialogVisible" max-width="800">
      <VCard v-if="selectedLog">
        <VCardTitle class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <VChip size="small" :color="getSeverityColor(selectedLog.severity)">
              <VIcon
                :icon="getSeverityIcon(selectedLog.severity)"
                size="14"
                class="me-1"
              />
              {{ selectedLog.severity }}
            </VChip>
            <span>Error Log Detail</span>
          </div>
          <IconBtn @click="detailDialogVisible = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <p class="text-body-2 text-disabled mb-1">Error Code</p>
              <code class="text-body-2">{{ selectedLog.errorCode }}</code>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-body-2 text-disabled mb-1">Error Type</p>
              <code class="text-caption">{{ selectedLog.errorType }}</code>
            </VCol>
            <VCol cols="12">
              <p class="text-body-2 text-disabled mb-1">Error Message</p>
              <VCard variant="outlined" class="pa-3">
                <p class="text-body-2 mb-0 text-error">
                  {{ selectedLog.errorMessage }}
                </p>
              </VCard>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-body-2 text-disabled mb-1">URL</p>
              <span class="text-body-2">{{ selectedLog.url || "-" }}</span>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-body-2 text-disabled mb-1">HTTP Method</p>
              <VChip size="small" variant="tonal">
                {{ selectedLog.httpMethod }}
              </VChip>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-body-2 text-disabled mb-1">Environment</p>
              <VChip
                size="small"
                :color="getEnvironmentColor(selectedLog.environment)"
                variant="tonal"
              >
                {{ selectedLog.environment }}
              </VChip>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-body-2 text-disabled mb-1">Review Status</p>
              <VChip
                size="small"
                :color="selectedLog.isReviewed ? 'success' : 'secondary'"
              >
                {{ selectedLog.isReviewed ? "Reviewed" : "Not Reviewed" }}
              </VChip>
            </VCol>
            <VCol v-if="selectedLog.stackTrace" cols="12">
              <p class="text-body-2 text-disabled mb-1">Stack Trace</p>
              <VCard variant="outlined" class="pa-3" color="grey-darken-4">
                <pre
                  class="text-caption mb-0"
                  style="white-space: pre-wrap; overflow-x: auto"
                  >{{ selectedLog.stackTrace }}</pre
                >
              </VCard>
            </VCol>
            <VCol v-if="selectedLog.context" cols="12">
              <p class="text-body-2 text-disabled mb-1">Context</p>
              <VCard variant="outlined" class="pa-3">
                <VRow>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-disabled mb-0">Request ID</p>
                    <code class="text-caption">{{
                      selectedLog.context.request_id
                    }}</code>
                  </VCol>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-disabled mb-0">IP Address</p>
                    <span class="text-caption">{{
                      selectedLog.context.ip_address
                    }}</span>
                  </VCol>
                  <VCol cols="12">
                    <p class="text-caption text-disabled mb-0">User Agent</p>
                    <span class="text-caption">{{
                      selectedLog.context.user_agent
                    }}</span>
                  </VCol>
                  <VCol cols="12">
                    <p class="text-caption text-disabled mb-0">Timestamp</p>
                    <span class="text-caption">{{
                      dayjs(selectedLog.context.timestamp).format(
                        "DD/MM/YYYY HH:mm:ss"
                      )
                    }}</span>
                  </VCol>
                </VRow>
              </VCard>
            </VCol>
            <VCol v-if="selectedLog.reviewedAt" cols="12">
              <p class="text-body-2 text-disabled mb-1">Review Info</p>
              <VCard variant="outlined" class="pa-3">
                <VRow>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-disabled mb-0">Reviewed By</p>
                    <span class="text-caption">{{
                      selectedLog.reviewedBy || "-"
                    }}</span>
                  </VCol>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-disabled mb-0">Reviewed At</p>
                    <span class="text-caption">{{
                      dayjs(selectedLog.reviewedAt).format(
                        "DD/MM/YYYY HH:mm:ss"
                      )
                    }}</span>
                  </VCol>
                  <VCol v-if="selectedLog.reviewNotes" cols="12">
                    <p class="text-caption text-disabled mb-0">Review Notes</p>
                    <span class="text-caption">{{
                      selectedLog.reviewNotes
                    }}</span>
                  </VCol>
                </VRow>
              </VCard>
            </VCol>
            <VCol cols="12">
              <p class="text-body-2 text-disabled mb-1">Created At</p>
              <span class="text-body-2">{{
                dayjs(selectedLog.createdAt).format("DD/MM/YYYY HH:mm:ss")
              }}</span>
            </VCol>
          </VRow>

          <div class="d-flex justify-end gap-3 mt-4">
            <VBtn color="secondary" @click="detailDialogVisible = false">
              Tutup
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
