<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import { showToast } from "@/utils/toaster";
import dayjs from "dayjs";
definePage({
  meta: {
    name: "Platform Invoices",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Subscription {
  subscriptionId: string;
  packageId: string;
  planId: string;
  status: string;
  currency: string;
  amount: number;
  billingInterval: string;
  billingIntervalCount: number;
  startsAt: string;
  endsAt: string;
}

interface Company {
  companyId: string;
  code: string;
  name: string;
}

interface Invoice {
  invoiceId: string;
  subscriptionId: string;
  companyId: string;
  businessUnitId: string | null;
  outletId: string | null;
  invoiceNumber: string;
  status: string;
  currency: string;
  amount: number;
  paidAmount: number;
  dueAt: string;
  paidAt: string | null;
  meta: any;
  createdAt: string;
  updatedAt: string;
  type: string;
  periodStart: string | null;
  periodEnd: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  billTo: string | null;
  billToEmail: string | null;
  billToAddress: string | null;
  lineItems: any;
  issueDate: string | null;
  notes: string | null;
  subscription?: Subscription;
  company?: Company;
  businessUnit?: any;
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

const isLoading = ref(false);
const paginateData = ref<{ data: Invoice[]; meta: PaginationMeta | null }>({
  data: [],
  meta: null,
});

const requestQuery = ref({
  page: 1,
  perPage: 10,
  search: "",
});

const additionalFilter = ref({
  status: "",
});

const search = ref("");
const createDialogVisible = ref(false);
const markPaidDialogVisible = ref(false);
const isLoadingAction = ref(false);
const selectedInvoice = ref<Invoice | null>(null);

const createForm = ref({
  subscriptionId: "",
  status: "draft",
  paidAmount: 0,
  paidAt: "",
  meta: {} as Record<string, any>,
});

const markPaidForm = ref({
  paidAmount: 0,
  paidAt: "",
  meta: {} as Record<string, any>,
});

const metaKey = ref("");
const metaValue = ref("");

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Invoice", key: "invoiceNumber", sortable: false },
  { title: "Company", key: "company", sortable: false },
  { title: "Amount", key: "amount", sortable: false },
  { title: "Paid", key: "paidAmount", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Due Date", key: "dueAt", sortable: false },
  { title: "Paid At", key: "paidAt", sortable: false },
  { title: "Aksi", key: "actions", width: "100px", sortable: false },
];

const dayjsJs = dayjs;

const fetchInvoices = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {
      page: requestQuery.value.page,
      perPage: requestQuery.value.perPage,
      include: "subscription,company,businessUnit",
    };

    if (requestQuery.value.search) {
      params["filter[invoiceNumber]"] = requestQuery.value.search;
    }

    if (additionalFilter.value.status) {
      params["filter[status]"] = additionalFilter.value.status;
    }

    const response = (await $rootAPI("/platform/billing/invoices", {
      method: "GET",
      params,
    })) as any;

    paginateData.value = {
      data: response.data || [],
      meta: response.meta || null,
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
  } finally {
    isLoading.value = false;
  }
};

const resetFilter = () => {
  search.value = "";
  requestQuery.value.search = "";
  requestQuery.value.page = 1;
  additionalFilter.value.status = "";
};

const openCreateDialog = () => {
  createForm.value = {
    subscriptionId: "",
    status: "draft",
    paidAmount: 0,
    paidAt: "",
    meta: {},
  };
  metaKey.value = "";
  metaValue.value = "";
  createDialogVisible.value = true;
};

const closeCreateDialog = () => {
  createDialogVisible.value = false;
};

const addMeta = (formType: "create" | "markPaid") => {
  if (metaKey.value.trim() && metaValue.value.trim()) {
    if (formType === "create") {
      createForm.value.meta[metaKey.value.trim()] = metaValue.value.trim();
    } else {
      markPaidForm.value.meta[metaKey.value.trim()] = metaValue.value.trim();
    }
    metaKey.value = "";
    metaValue.value = "";
  }
};

const removeMeta = (key: string, formType: "create" | "markPaid") => {
  if (formType === "create") {
    delete createForm.value.meta[key];
  } else {
    delete markPaidForm.value.meta[key];
  }
};

const handleCreateInvoice = async () => {
  try {
    isLoadingAction.value = true;

    const payload: any = {
      subscriptionId: createForm.value.subscriptionId,
      status: createForm.value.status,
      paidAmount: createForm.value.paidAmount,
      meta: createForm.value.meta,
    };

    if (createForm.value.paidAt) {
      payload.paidAt = createForm.value.paidAt;
    }

    await $rootAPI("/platform/billing/invoices", {
      method: "POST",
      body: payload,
    });

    showToast("Invoice berhasil dibuat", "success");
    closeCreateDialog();
    await fetchInvoices();
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    showToast(error?.message || "Gagal membuat invoice", "error");
  } finally {
    isLoadingAction.value = false;
  }
};

const openMarkPaidDialog = (invoice: Invoice) => {
  selectedInvoice.value = invoice;
  markPaidForm.value = {
    paidAmount: invoice.amount - invoice.paidAmount,
    paidAt: dayjs().format("YYYY-MM-DD"),
    meta: {},
  };
  metaKey.value = "";
  metaValue.value = "";
  markPaidDialogVisible.value = true;
};

const handleMarkPaid = async () => {
  if (!selectedInvoice.value) return;

  try {
    isLoadingAction.value = true;

    await $rootAPI(
      `/platform/billing/invoices/${selectedInvoice.value.invoiceId}/mark-paid`,
      {
        method: "PUT",
        body: {
          paidAmount: markPaidForm.value.paidAmount,
          paidAt: markPaidForm.value.paidAt,
          meta: markPaidForm.value.meta,
        },
      }
    );

    showToast("Invoice berhasil ditandai lunas", "success");
    markPaidDialogVisible.value = false;
    await fetchInvoices();
  } catch (error: any) {
    console.error("Error marking invoice as paid:", error);
    showToast(error?.message || "Gagal menandai invoice lunas", "error");
  } finally {
    isLoadingAction.value = false;
  }
};

const formatCurrency = (value: number, currency: string = "IDR") => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "secondary",
    pending: "warning",
    paid: "success",
    partial: "info",
    overdue: "error",
    cancelled: "secondary",
    refunded: "warning",
  };
  return colors[status] || "secondary";
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: "Draft",
    pending: "Pending",
    paid: "Lunas",
    partial: "Sebagian",
    overdue: "Terlambat",
    cancelled: "Dibatalkan",
    refunded: "Dikembalikan",
  };
  return texts[status] || status;
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
    await fetchInvoices();
  },
  { deep: true }
);

onMounted(async () => {
  await fetchInvoices();
});
</script>

<template>
  <div data-testid="platform-invoices-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Invoices</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDialog"
        >
          Buat Invoice
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari invoice number..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="3">
            <AppSelect
              v-model="additionalFilter.status"
              label="Status"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Draft', value: 'draft' },
                { title: 'Pending', value: 'pending' },
                { title: 'Lunas', value: 'paid' },
                { title: 'Sebagian', value: 'partial' },
                { title: 'Terlambat', value: 'overdue' },
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

        <template #item.invoiceNumber="{ item }">
          <span class="font-weight-medium text-primary">
            {{ item.invoiceNumber }}
          </span>
        </template>

        <template #item.company="{ item }">
          <div v-if="item.company">
            <div class="font-weight-medium">{{ item.company.name }}</div>
            <div class="text-caption text-disabled">
              {{ item.company.code }}
            </div>
          </div>
          <span v-else class="text-disabled">-</span>
        </template>

        <template #item.amount="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.amount, item.currency) }}
          </span>
        </template>

        <template #item.paidAmount="{ item }">
          <span :class="item.paidAmount > 0 ? 'text-success' : ''">
            {{ formatCurrency(item.paidAmount, item.currency) }}
          </span>
        </template>

        <template #item.status="{ item }">
          <VChip size="small" :color="getStatusColor(item.status)">
            {{ getStatusText(item.status) }}
          </VChip>
        </template>

        <template #item.dueAt="{ item }">
          {{ dayjsJs(item.dueAt).format("DD/MM/YYYY") }}
        </template>

        <template #item.paidAt="{ item }">
          {{
            item.paidAt ? dayjsJs(item.paidAt).format("DD/MM/YYYY HH:mm") : "-"
          }}
        </template>

        <template #item.actions="{ item }">
          <IconBtn
            v-if="item.status !== 'paid' && item.status !== 'cancelled'"
            size="small"
            @click="openMarkPaidDialog(item)"
          >
            <VIcon icon="tabler-check" color="success" />
            <VTooltip activator="parent"> Tandai Lunas </VTooltip>
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create Invoice Dialog -->
    <VDialog v-model="createDialogVisible" max-width="600">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Buat Invoice Baru</span>
          <IconBtn @click="closeCreateDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm @submit.prevent="handleCreateInvoice">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="createForm.subscriptionId"
                  label="Subscription ID"
                  placeholder="019ac874-5a26-7170-89c7-72413cf39de0"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.status"
                  label="Status"
                  :items="[
                    { title: 'Draft', value: 'draft' },
                    { title: 'Pending', value: 'pending' },
                    { title: 'Partial', value: 'partial' },
                    { title: 'Paid', value: 'paid' },
                  ]"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model.number="createForm.paidAmount"
                  label="Paid Amount"
                  type="number"
                  placeholder="50000"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="createForm.paidAt"
                  label="Paid At (optional)"
                  type="date"
                />
              </VCol>
              <VCol cols="12">
                <VDivider />
                <p class="text-caption text-disabled mt-3 mb-2">
                  Meta (opsional) - Data tambahan
                </p>
                <div class="d-flex gap-2 mb-3">
                  <AppTextField
                    v-model="metaKey"
                    placeholder="Key (amountOverride, dueAtOverride)"
                    density="compact"
                  />
                  <AppTextField
                    v-model="metaValue"
                    placeholder="Value"
                    density="compact"
                  />
                  <VBtn color="primary" size="small" @click="addMeta('create')">
                    Tambah
                  </VBtn>
                </div>
                <div
                  v-if="Object.keys(createForm.meta).length > 0"
                  class="d-flex flex-wrap gap-2"
                >
                  <VChip
                    v-for="(value, key) in createForm.meta"
                    :key="key"
                    closable
                    color="primary"
                    variant="tonal"
                    @click:close="removeMeta(String(key), 'create')"
                  >
                    <strong>{{ key }}:</strong>&nbsp;{{ value }}
                  </VChip>
                </div>
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="closeCreateDialog"
              >
                Batal
              </VBtn>
              <VBtn color="primary" :loading="isLoadingAction" type="submit">
                Buat Invoice
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Mark Paid Dialog -->
    <VDialog v-model="markPaidDialogVisible" max-width="500">
      <VCard>
        <VCardTitle>Tandai Invoice Lunas</VCardTitle>
        <VDivider />
        <VCardText>
          <div v-if="selectedInvoice" class="mb-4">
            <p class="text-body-2 mb-1">
              <strong>Invoice:</strong> {{ selectedInvoice.invoiceNumber }}
            </p>
            <p class="text-body-2 mb-1">
              <strong>Total Amount:</strong>
              {{
                formatCurrency(selectedInvoice.amount, selectedInvoice.currency)
              }}
            </p>
            <p class="text-body-2 mb-1">
              <strong>Already Paid:</strong>
              {{
                formatCurrency(
                  selectedInvoice.paidAmount,
                  selectedInvoice.currency
                )
              }}
            </p>
            <p class="text-body-2">
              <strong>Remaining:</strong>
              {{
                formatCurrency(
                  selectedInvoice.amount - selectedInvoice.paidAmount,
                  selectedInvoice.currency
                )
              }}
            </p>
          </div>

          <VForm @submit.prevent="handleMarkPaid">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model.number="markPaidForm.paidAmount"
                  label="Paid Amount"
                  type="number"
                  placeholder="100000"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="markPaidForm.paidAt"
                  label="Paid At"
                  type="date"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <VDivider />
                <p class="text-caption text-disabled mt-3 mb-2">
                  Meta (opsional)
                </p>
                <div class="d-flex gap-2 mb-3">
                  <AppTextField
                    v-model="metaKey"
                    placeholder="Key"
                    density="compact"
                  />
                  <AppTextField
                    v-model="metaValue"
                    placeholder="Value"
                    density="compact"
                  />
                  <VBtn
                    color="primary"
                    size="small"
                    @click="addMeta('markPaid')"
                  >
                    Tambah
                  </VBtn>
                </div>
                <div
                  v-if="Object.keys(markPaidForm.meta).length > 0"
                  class="d-flex flex-wrap gap-2"
                >
                  <VChip
                    v-for="(value, key) in markPaidForm.meta"
                    :key="key"
                    closable
                    color="primary"
                    variant="tonal"
                    @click:close="removeMeta(String(key), 'markPaid')"
                  >
                    <strong>{{ key }}:</strong>&nbsp;{{ value }}
                  </VChip>
                </div>
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="markPaidDialogVisible = false"
              >
                Batal
              </VBtn>
              <VBtn
                color="success"
                :loading="isLoadingAction"
                @click="handleMarkPaid"
              >
                Tandai Lunas
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
