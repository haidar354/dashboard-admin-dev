<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import { showToast } from "@/utils/toaster";
import dayjs from "dayjs";
const dayjsJs = dayjs;

definePage({
  meta: {
    name: "Admin Subscriptions",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Subscription {
  subscriptionId: string;
  companyId: string;
  packageId: string;
  planId: string;
  status: string;
  currency: string;
  amount: number;
  billingInterval: string;
  billingIntervalCount: number;
  startsAt: string;
  endsAt: string;
  company: any;
  businessUnit: any;
  outlet: any;
  package: any;
  plan: any;
}

const isLoading = ref(false);
const subscriptions = ref<Subscription[]>([]);
const search = ref("");
const page = ref(1);
const perPage = ref(20);
const total = ref(0);
const lastPage = ref(1);

// Filter
const selectedCompany = ref(null);
const statusFilter = ref("");
const planFilter = ref("");

// Master data
const companies = ref<any[]>([]);
const plans = ref<any[]>([]);
const packages = ref<any[]>([]);
const businessUnits = ref<any[]>([]);
const outlets = ref<any[]>([]);

// Dialog states
const dialogCancel = ref(false);
const dialogUpgrade = ref(false);
const dialogRenew = ref(false);
const dialogCreate = ref(false);
const selectedSubscription = ref<Subscription | null>(null);

// Form refs
const refCancelForm = ref();
const refUpgradeForm = ref();
const refRenewForm = ref();
const refCreateForm = ref();

// Form data
const cancelForm = ref({
  immediate: true,
  reason: "",
});

const upgradeForm = ref({
  planId: "",
  immediate: true,
});
const currentPlanName = ref("-");

const renewForm = ref({
  periods: 1,
});

const createForm = ref({
  companyId: "",
  businessUnitId: "",
  outletId: "",
  packageId: "",
  planId: "",
  status: "active",
  currency: "IDR",
  amount: 0,
  billingInterval: "month",
  billingIntervalCount: 1,
  startsAt: "",
  endsAt: "",
  meta: {},
});

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Company", key: "companyName", sortable: true },
  { title: "Business Unit", key: "businessUnitName", sortable: false },
  { title: "Outlet", key: "outletName", sortable: false },
  { title: "Package", key: "packageName", sortable: false },
  { title: "Plan", key: "planName", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Periode", key: "period", sortable: false },
  { title: "Harga", key: "price", sortable: false },
  { title: "Aksi", key: "actions", width: "150px", sortable: false },
];

// Fetch companies
const fetchCompanies = async () => {
  try {
    const response: any = await $rootAPI("/platform/tenant/companies/all", {
      method: "GET",
    });

    companies.value = response.data.map((c: any) => ({
      value: c.companyId,
      title: c.name,
    }));
  } catch (error: any) {
    console.error("Error fetching companies:", error);
  }
};

// Fetch plans
const fetchPlans = async () => {
  try {
    const response: any = await $rootAPI("/platform/billing/plans", {
      method: "GET",
      params: { perPage: 100 },
    });

    plans.value = response.data.map((p: any) => ({
      value: p.planId,
      title: p.name,
      packageId: p.packageId,
      amount: p.amount,
      currency: p.currency,
      interval: p.interval,
      intervalCount: p.intervalCount,
    }));
  } catch (error: any) {
    console.error("Error fetching plans:", error);
  }
};

// Fetch packages
const fetchPackages = async () => {
  try {
    const response: any = await $rootAPI("/platform/system-config/packages", {
      method: "GET",
      params: { perPage: 100 },
    });

    packages.value = response.data.map((p: any) => ({
      value: p.packageId,
      title: p.name,
    }));
  } catch (error: any) {
    console.error("Error fetching packages:", error);
  }
};

// Fetch business units by company
const fetchBusinessUnits = async (companyId: string) => {
  try {
    const response: any = await $rootAPI("/platform/tenant/business-units", {
      method: "GET",
      params: {
        perPage: 100,
        "filter[companyId]": companyId,
      },
    });

    businessUnits.value = [
      { value: "", title: "Tidak ada" },
      ...response.data.map((bu: any) => ({
        value: bu.businessUnitId,
        title: bu.name,
      })),
    ];
  } catch (error: any) {
    console.error("Error fetching business units:", error);
  }
};

// Fetch outlets by business unit
const fetchOutlets = async (businessUnitId: string) => {
  try {
    const response: any = await $rootAPI("/platform/tenant/outlets", {
      method: "GET",
      params: {
        perPage: 100,
        "filter[businessUnitId]": businessUnitId,
      },
    });

    outlets.value = [
      { value: "", title: "Tidak ada" },
      ...response.data.map((o: any) => ({
        value: o.outletId,
        title: o.name,
      })),
    ];
  } catch (error: any) {
    console.error("Error fetching outlets:", error);
  }
};

// Fetch subscriptions
const fetchSubscriptions = async () => {
  if (!selectedCompany.value) {
    subscriptions.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const params: any = {
      page: page.value,
      perPage: perPage.value,
      include: "company,businessUnit,outlet,package,plan",
    };

    if (search.value) params.search = search.value;
    if (statusFilter.value) params["filter[status]"] = statusFilter.value;
    if (planFilter.value) params["filter[planId]"] = planFilter.value;

    const response: any = await $rootAPI(
      `/platform/billing/tenants/${selectedCompany.value}/subscriptions`,
      {
        method: "GET",
        params,
      }
    );

    const apiData = response.data || response.data?.data || [];
    const meta = response.data?.meta || response.meta || {};

    subscriptions.value = apiData;
    total.value = meta.total || 0;
    lastPage.value = meta.lastPage || 1;
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    showToast("Gagal memuat data subscription", "error");
  } finally {
    isLoading.value = false;
  }
};

// Search with debounce
const handleSearch = customDebounce(() => {
  page.value = 1;
  fetchSubscriptions();
}, 500);

watch(search, () => handleSearch());
watch(page, () => fetchSubscriptions());
watch(perPage, () => {
  page.value = 1;
  fetchSubscriptions();
});
watch([selectedCompany, statusFilter, planFilter], () => {
  page.value = 1;
  fetchSubscriptions();
});

// Watch company change
watch(
  () => createForm.value.companyId,
  async (newVal) => {
    if (newVal) {
      await fetchBusinessUnits(newVal);
      createForm.value.businessUnitId = "";
      createForm.value.outletId = "";
    }
  }
);

// Watch business unit change
watch(
  () => createForm.value.businessUnitId,
  async (newVal) => {
    if (newVal) {
      await fetchOutlets(newVal);
      createForm.value.outletId = "";
    }
  }
);

// Watch plan change
watch(
  () => createForm.value.planId,
  (newVal) => {
    const selectedPlan = plans.value.find((p) => p.value === newVal);
    if (selectedPlan) {
      createForm.value.packageId = selectedPlan.packageId;
      createForm.value.amount = selectedPlan.amount;
      createForm.value.currency = selectedPlan.currency;
      createForm.value.billingInterval = selectedPlan.interval;
      createForm.value.billingIntervalCount = selectedPlan.intervalCount;
    }
  }
);

// Open create dialog
const openCreateDialog = () => {
  resetCreateForm();
  dialogCreate.value = true;
};

// Reset create form
const resetCreateForm = () => {
  createForm.value = {
    companyId: "",
    businessUnitId: "",
    outletId: "",
    packageId: "",
    planId: "",
    status: "active",
    currency: "IDR",
    amount: 0,
    billingInterval: "month",
    billingIntervalCount: 1,
    startsAt: "",
    endsAt: "",
    meta: {},
  };
  businessUnits.value = [];
  outlets.value = [];
  refCreateForm.value?.reset();
  refCreateForm.value?.resetValidation();
};

// Submit create
const submitCreate = async () => {
  const { valid } = await refCreateForm.value?.validate();
  if (!valid) return;

  try {
    isLoading.value = true;
    const payload = {
      ...createForm.value,
      businessUnitId: createForm.value.businessUnitId || null,
      outletId: createForm.value.outletId || null,
    };

    await $rootAPI("/platform/billing/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showToast("Subscription berhasil dibuat", "success");
    dialogCreate.value = false;
    fetchSubscriptions();
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    showToast(
      error.response?.data?.message || "Gagal membuat subscription",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

// Open cancel dialog
const openCancelDialog = (subscription: Subscription) => {
  selectedSubscription.value = subscription;
  cancelForm.value = {
    immediate: true,
    reason: "",
  };
  dialogCancel.value = true;
};

// Submit cancel
const submitCancel = async () => {
  const { valid } = await refCancelForm.value?.validate();
  if (!valid) return;

  try {
    isLoading.value = true;
    await $rootAPI(
      `/platform/billing/subscriptions/${selectedSubscription.value?.subscriptionId}/cancel`,
      {
        method: "PUT",
        body: JSON.stringify(cancelForm.value),
      }
    );

    showToast("Subscription berhasil dibatalkan", "success");
    dialogCancel.value = false;
    fetchSubscriptions();
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    showToast(
      error.response?.data?.message || "Gagal membatalkan subscription",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

// Open upgrade dialog
const openUpgradeDialog = (subscription: Subscription) => {
  selectedSubscription.value = subscription;
  upgradeForm.value = {
    planId: subscription.planId || subscription.plan?.planId || "",
    immediate: true,
  };
  currentPlanName.value = subscription.plan?.name || "-";
  refUpgradeForm.value?.resetValidation();
  dialogUpgrade.value = true;
};

// Submit upgrade
const submitUpgrade = async () => {
  const { valid } = await refUpgradeForm.value?.validate();
  if (!valid) return;

  try {
    isLoading.value = true;
    await $rootAPI(
      `/platform/billing/subscriptions/${selectedSubscription.value?.subscriptionId}/upgrade`,
      {
        method: "PUT",
        body: JSON.stringify(upgradeForm.value),
      }
    );

    showToast("Subscription berhasil diupgrade", "success");
    dialogUpgrade.value = false;
    fetchSubscriptions();
  } catch (error: any) {
    console.error("Error upgrading subscription:", error);
    showToast(
      error.response?.data?.message || "Gagal upgrade subscription",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

// Open renew dialog
const openRenewDialog = (subscription: Subscription) => {
  selectedSubscription.value = subscription;
  renewForm.value = {
    periods: 1,
  };
  dialogRenew.value = true;
};

// Submit renew
const submitRenew = async () => {
  const { valid } = await refRenewForm.value?.validate();
  if (!valid) return;

  try {
    isLoading.value = true;
    await $rootAPI(
      `/platform/billing/subscriptions/${selectedSubscription.value?.subscriptionId}/renew`,
      {
        method: "PUT",
        body: JSON.stringify(renewForm.value),
      }
    );

    showToast("Subscription berhasil diperpanjang", "success");
    dialogRenew.value = false;
    fetchSubscriptions();
  } catch (error: any) {
    console.error("Error renewing subscription:", error);
    showToast(
      error.response?.data?.message || "Gagal memperpanjang subscription",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

// Format currency
const formatCurrency = (value: number, currency: string = "IDR") => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

// Get status color
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "success",
    trial: "warning",
    expired: "error",
    canceled: "secondary",
    cancelled: "secondary",
    pending: "info",
  };
  return colors[status] || "secondary";
};

onMounted(async () => {
  await Promise.all([fetchCompanies(), fetchPlans(), fetchPackages()]);
});
</script>

<template>
  <div data-testid="admin-subscriptions-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Manajemen Subscription</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDialog"
          :disabled="!selectedCompany"
        >
          Tambah Subscription
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" md="3">
            <AppSelect
              v-model="selectedCompany"
              label="Pilih Company"
              placeholder="Pilih company"
              :items="companies"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari subscription..."
              prepend-inner-icon="tabler-search"
              clearable
              :disabled="!selectedCompany"
            />
          </VCol>
          <VCol cols="12" md="2">
            <AppSelect
              v-model="statusFilter"
              label="Status"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Active', value: 'active' },
                { title: 'Trial', value: 'trial' },
                { title: 'Expired', value: 'expired' },
                { title: 'Cancelled', value: 'canceled' },
              ]"
              clearable
              :disabled="!selectedCompany"
            />
          </VCol>
          <VCol cols="12" md="2">
            <AppSelect
              v-model="planFilter"
              label="Plan"
              :items="[
                { title: 'Semua', value: '' },
                ...plans.map((p) => ({ title: p.title, value: p.value })),
              ]"
              clearable
              :disabled="!selectedCompany"
            />
          </VCol>
          <VCol cols="12" md="2" class="d-flex align-center mt-6">
            <VBtn
              variant="outlined"
              @click="
                () => {
                  statusFilter = '';
                  planFilter = '';
                  search = '';
                }
              "
              :disabled="!selectedCompany"
            >
              Reset
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        v-model:page="page"
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="subscriptions"
        :items-length="total"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * perPage + index + 1 }}
        </template>

        <template #item.companyName="{ item }">
          <span class="font-weight-medium">{{
            item.company?.name || "-"
          }}</span>
        </template>

        <template #item.businessUnitName="{ item }">
          <span class="text-body-2">{{ item.businessUnit?.name || "-" }}</span>
        </template>

        <template #item.outletName="{ item }">
          <span class="text-body-2">{{ item.outlet?.name || "-" }}</span>
        </template>

        <template #item.packageName="{ item }">
          <VChip size="small" color="info" variant="tonal">
            {{ item.package?.name || "-" }}
          </VChip>
        </template>

        <template #item.planName="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.plan?.name || "-" }}
          </VChip>
        </template>

        <template #item.status="{ item }">
          <VChip size="small" :color="getStatusColor(item.status)">
            {{ item.status }}
          </VChip>
        </template>

        <template #item.period="{ item }">
          <div class="text-body-2">
            {{ dayjsJs(item.startsAt).format("DD/MM/YYYY") }} -
            {{ dayjsJs(item.endsAt).format("DD/MM/YYYY") }}
          </div>
        </template>

        <template #item.price="{ item }">
          {{ formatCurrency(item.amount, item.currency) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              icon
              size="small"
              variant="text"
              color="success"
              @click="openRenewDialog(item)"
            >
              <VIcon icon="tabler-refresh" size="22" />
              <VTooltip activator="parent">Renew</VTooltip>
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              color="info"
              @click="openUpgradeDialog(item)"
            >
              <VIcon icon="tabler-arrow-up" size="22" />
              <VTooltip activator="parent">Upgrade</VTooltip>
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              color="error"
              @click="openCancelDialog(item)"
            >
              <VIcon icon="tabler-x" size="22" />
              <VTooltip activator="parent">Cancel</VTooltip>
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create Dialog -->
    <VDialog v-model="dialogCreate" max-width="800px" persistent scrollable>
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">Tambah Subscription</span>
          <IconBtn @click="dialogCreate = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VForm ref="refCreateForm" @submit.prevent="submitCreate">
            <VRow>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.companyId"
                  label="Company"
                  placeholder="Pilih company"
                  :items="companies"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.businessUnitId"
                  label="Business Unit"
                  placeholder="Pilih business unit (opsional)"
                  :items="businessUnits"
                  :disabled="!createForm.companyId"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.outletId"
                  label="Outlet"
                  placeholder="Pilih outlet (opsional)"
                  :items="outlets"
                  :disabled="!createForm.businessUnitId"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.planId"
                  label="Plan"
                  placeholder="Pilih plan"
                  :items="plans"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="createForm.startsAt"
                  label="Tanggal Mulai"
                  type="date"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="createForm.endsAt"
                  label="Tanggal Selesai"
                  type="date"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.status"
                  label="Status"
                  :items="[
                    { title: 'Active', value: 'active' },
                    { title: 'Trial', value: 'trial' },
                    { title: 'Pending', value: 'pending' },
                  ]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.currency"
                  label="Currency"
                  :items="[
                    { title: 'IDR', value: 'IDR' },
                    { title: 'USD', value: 'USD' },
                  ]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="createForm.amount"
                  label="Amount"
                  type="number"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.billingInterval"
                  label="Billing Interval"
                  :items="[
                    { title: 'Month', value: 'month' },
                    { title: 'Year', value: 'year' },
                  ]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="createForm.billingIntervalCount"
                  label="Interval Count"
                  type="number"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                color="secondary"
                variant="outlined"
                @click="dialogCreate = false"
              >
                Batal
              </VBtn>
              <VBtn color="primary" type="submit" :loading="isLoading">
                Simpan
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Cancel Dialog -->
    <VDialog v-model="dialogCancel" max-width="500px">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">Cancel Subscription</span>
          <IconBtn @click="dialogCancel = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VForm ref="refCancelForm" @submit.prevent="submitCancel">
            <p class="mb-4">
              Batalkan subscription untuk
              <strong>{{ selectedSubscription?.company?.name }}</strong
              >?
            </p>
            <AppTextarea
              v-model="cancelForm.reason"
              label="Alasan"
              placeholder="Masukkan alasan pembatalan"
              rows="3"
              :rules="[requiredValidator]"
            />
            <VSwitch
              v-model="cancelForm.immediate"
              label="Cancel segera"
              color="error"
              class="mt-2"
            />
            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                color="secondary"
                variant="outlined"
                @click="dialogCancel = false"
              >
                Batal
              </VBtn>
              <VBtn color="error" type="submit" :loading="isLoading">
                Cancel Subscription
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Upgrade Dialog -->
    <VDialog v-model="dialogUpgrade" max-width="500px">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">Upgrade Subscription</span>
          <IconBtn @click="dialogUpgrade = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VForm ref="refUpgradeForm" @submit.prevent="submitUpgrade">
            <p class="mb-2 text-caption text-disabled">
              Plan saat ini: <strong>{{ currentPlanName }}</strong>
            </p>
            <p class="mb-4">
              Upgrade subscription untuk
              <strong>{{ selectedSubscription?.company?.name }}</strong>
            </p>
            <AppSelect
              v-model="upgradeForm.planId"
              label="Plan Baru"
              placeholder="Pilih plan"
              :items="plans"
              :rules="[requiredValidator]"
            />
            <VSwitch
              v-model="upgradeForm.immediate"
              label="Upgrade segera"
              color="primary"
              class="mt-2"
            />
            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                color="secondary"
                variant="outlined"
                @click="dialogUpgrade = false"
              >
                Batal
              </VBtn>
              <VBtn color="primary" type="submit" :loading="isLoading">
                Upgrade
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Renew Dialog -->
    <VDialog v-model="dialogRenew" max-width="500px">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">Renew Subscription</span>
          <IconBtn @click="dialogRenew = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VForm ref="refRenewForm" @submit.prevent="submitRenew">
            <p class="mb-4">
              Perpanjang subscription untuk
              <strong>{{ selectedSubscription?.company?.name }}</strong>
            </p>
            <AppTextField
              v-model="renewForm.periods"
              label="Jumlah Periode"
              type="number"
              placeholder="Masukkan jumlah periode"
              :rules="[requiredValidator]"
            />
            <div class="text-caption text-disabled mt-2">
              Periode saat ini berakhir:
              {{ dayjsJs(selectedSubscription?.endsAt).format("DD/MM/YYYY") }}
            </div>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                color="secondary"
                variant="outlined"
                @click="dialogRenew = false"
              >
                Batal
              </VBtn>
              <VBtn color="success" type="submit" :loading="isLoading">
                Renew
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
